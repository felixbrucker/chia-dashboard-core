const http = require('http');
const http2 = require('http2');
const Koa = require('koa');
const KoaRouter = require('koa-router');
const koaBodyParser = require('koa-bodyparser');
const compress = require('koa-compress');
const etag = require('koa-etag');
const cors = require('@koa/cors');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const semver = require('semver');

const logger = require('./logger');
const config = require('./config');
const oAuth = require('./oauth');
const Satellite = require('./db/satellite');
const ipMiddleware = require('../middleware/ip');
const loggingMiddleware = require('../middleware/logging');
const authenticationMiddleware = require('../middleware/authentication');
const satelliteAuthMiddleware = require('../middleware/satellite-auth');
const shareKeyAuthMiddleware = require('../middleware/share-key-auth');
const rateLimitMiddleware = require('../middleware/rate-limit');
const sentryService = require('./sentry-service');
const rateService = require('./rate-service');
const updateSatelliteStatsApiLayer = require('../api-layer/update-satellite-stats');
const ServiceType = require('../service-type')
const updateQueryFactory = require('./update-query-factory')
const {merge} = require('lodash')

class Api {
  constructor() {
    const app = new Koa();
    app.on('error', err => {
      logger.log({level: 'error', msg: `API | HTTP | Error: ${err.message}`});
      sentryService.captureException(err);
    });
    app.use(cors({ maxAge: 86400 }));
    app.use(koaBodyParser({
      jsonLimit: '10mb',
    }));
    app.use(compress());

    app.use(ipMiddleware);
    app.use(loggingMiddleware);
    app.use(etag());

    const router = new KoaRouter();
    router.use(rateLimitMiddleware({
      threshold: 60,
      ttl: 60,
    }));

    router.get('/api/ping', this.onPing.bind(this));
    router.post(
      '/api/oauth/token',
      async (ctx, next) => {
        logger.log({level: 'debug', msg: `OAuth | [${ctx.realIp}] | ${JSON.stringify(ctx.request.body)}`});
        await next();
      },
      rateLimitMiddleware({ threshold: 5, ttl: 60 }),
      this.onToken.bind(this)
    );

    router.get('/api/rates', this.onRates.bind(this));

    router.patch('/api/satellite', satelliteAuthMiddleware, this.onNewSatelliteStats.bind(this));

    router.get('/api/me', authenticationMiddleware({ fetchUser: true }), this.onGetUser.bind(this));
    router.patch('/api/me', authenticationMiddleware({ fetchUser: true }), this.onUpdateUser.bind(this));
    router.get('/api/satellites', authenticationMiddleware({ fetchUser: false }), this.onGetSatellites.bind(this));
    router.get('/api/shared/satellites', shareKeyAuthMiddleware, this.onGetSatellites.bind(this));
    router.post('/api/satellite', authenticationMiddleware({ fetchUser: false }), this.onCreateSatellite.bind(this));
    router.delete('/api/satellite/:id', authenticationMiddleware({ fetchUser: false }), this.onDeleteSatellite.bind(this));
    router.patch('/api/satellite/:id', authenticationMiddleware({ fetchUser: false }), this.onUpdateSatellite.bind(this));

    app.use(router.routes());
    app.use(router.allowedMethods());

    if (config.isSslEnabled) {
      this.server = http2.createSecureServer({
        ...config.ssl,
        allowHTTP1: true,
      }, app.callback());
    } else {
      this.server = http.createServer(app.callback());
    }
  }

  async init() {
    await new Promise(resolve => this.server.listen(config.listenPort, config.listenHost, resolve));
    logger.log({level: 'info', msg: `API | Initialized and reachable on http${config.isSslEnabled ? 's' : ''}://${config.listenHost}:${config.listenPort}`});
  }

  async onPing(ctx) {
    ctx.body = { success: true };
    ctx.set('Cache-Control', 'public, max-age=10');
  }

  async onToken(ctx) {
    if (!ctx.request.body) {
      ctx.status = 400;
      ctx.body = { error: 'Invalid request!' };
      return;
    }
    try {
      const { accessToken, refreshToken } = await oAuth.authenticate(ctx.request.body);

      ctx.body = {
        token_type: 'Bearer',
        expires_in: 600,
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    } catch (err) {
      ctx.status = 400;
      ctx.body = { error: err.message };
    }
  }

  async onGetUser(ctx) {
    ctx.body = ctx.user.toJSON();
  }

  async onGetSatellites(ctx) {
    const satellites = await Satellite.find({ user: ctx.userId });
    ctx.body = satellites.map(satellite => satellite.toJSON());
  }

  async onCreateSatellite(ctx) {
    const body = ctx.request.body;

    const id = new mongoose.Types.ObjectId();
    const satellite = new Satellite({
      _id: id,
      user: new mongoose.Types.ObjectId(ctx.userId),
      name: body.name,
      apiKey: uuidv4(),
      services: {},
    });
    await satellite.save();

    ctx.body = satellite.toJSON();
    ctx.body.apiKey = satellite.apiKey;
  }

  async onDeleteSatellite(ctx) {
    const satellite = await Satellite.findById(ctx.params.id);
    if (!satellite || satellite.user.toString() !== ctx.userId) {
      ctx.body = { error: `Satellite ${ctx.params.id} not found` };
      ctx.status = 400;

      return;
    }
    await Satellite.deleteOne({ _id: satellite.id });

    ctx.status = 204;
  }

  async onNewSatelliteStats(ctx) {
    const body = ctx.request.body

    const satellite = ctx.satellite
    const satelliteVersion = ctx.request.headers['satellite-version']

    // Enforce 1.13.0 or greater
    if (satelliteVersion && semver.lt(satelliteVersion, '1.13.0')) {
      ctx.status = 204
      return
    }

    const updateQuery = {}
    if (satelliteVersion
      && satellite.version !== satelliteVersion
      && semver.valid(satelliteVersion)
      && (!satellite.version || semver.gt(satelliteVersion, satellite.version))
    ) {
      updateQuery.version = satelliteVersion
    }

    Object.values(ServiceType)
      .filter(service => body[service] !== undefined)
      .forEach(service => {
        if (body[service] === null) {
          updateQuery.$unset = merge((updateQuery.$unset || {}), {
            [`services.${service}.stats`]: null,
          })
        } else {
          updateSatelliteStatsApiLayer.apply(service, body[service])
          const updateQueryForService = updateQueryFactory.makeUpdateQuery(service, body[service])
          Object.entries(updateQueryForService).forEach(([key, value]) => {
            updateQuery[key] = value
          })
        }
        updateQuery[`services.${service}.lastUpdate`] = new Date()
      })
    await Satellite.updateOne({ _id: satellite._id }, updateQuery)
    ctx.status = 204
  }

  async onUpdateSatellite(ctx) {
    const satellite = await Satellite.findById(ctx.params.id);
    if (!satellite || satellite.user.toString() !== ctx.userId) {
      ctx.body = { error: `Satellite ${ctx.params.id} not found` };
      ctx.status = 400;

      return;
    }
    const body = ctx.request.body;
    let updated = false;
    if (body.name && satellite.name !== body.name) {
      satellite.name = body.name.toString();
      updated = true;
    }
    if (body.hidden !== undefined && satellite.hidden !== body.hidden) {
      satellite.hidden = !!body.hidden;
      updated = true;
    }
    if (updated) {
      await satellite.save();
    }

    ctx.status = 204;
  }

  async onUpdateUser(ctx) {
    const body = ctx.request.body;
    let updated = false;
    if (body.isShared !== !!ctx.user.shareKey) {
      ctx.user.shareKey = body.isShared ? uuidv4() : null;
      updated = true;
    }
    if (updated) {
      await ctx.user.save();
    }

    ctx.status = 204;
  }

  async onRates(ctx) {
    ctx.body = {
      rates: rateService.rates,
      currencies: rateService.currencies,
    };
    ctx.set('Cache-Control', 'public,max-age=300');
  }
}

module.exports = new Api();
