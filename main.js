const sentryService = require('./lib/service/sentry-service');
const api = require('./lib/service/api');
const db = require('./lib/service/db');
const oAuth = require('./lib/service/oauth');
const housekeeping = require('./lib/service/housekeeping');
const rateService = require('./lib/service/rate-service');
const migrations = require('./lib/migrations');

(async () => {
  sentryService.init();
  await db.init();
  await migrations.migrate();
  await oAuth.init();
  await housekeeping.init();
  await rateService.init();
  await api.init();
})();
