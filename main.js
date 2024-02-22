const sentryService = require('./lib/service/sentry-service');
const api = require('./lib/service/api');
const db = require('./lib/service/db');
const oAuth = require('./lib/service/oauth');
const rateService = require('./lib/service/rate-service');
const migrations = require('./lib/migrations');
const config = require('./lib/service/config');
const CloudflareTunnel = require('./lib/service/cloudflare-tunnel');

(async () => {
  sentryService.init();
  await db.init();
  await migrations.migrate();
  await oAuth.init();
  await rateService.init();
  await api.init();
  if (config.cloudflaredTunnelToken !== undefined) {
    const cloudflareTunnel = new CloudflareTunnel(config.cloudflaredTunnelToken)
    await cloudflareTunnel.init()
  }
})();
