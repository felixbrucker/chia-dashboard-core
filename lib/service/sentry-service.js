const Sentry = require('@sentry/node');
const Integrations = require('@sentry/integrations');
const version = require('../version');
const config = require('./config');

class SentryService {
  init() {
    if (!config.sentryDsn) {
      return;
    }
    Sentry.init({
      dsn: config.sentryDsn,
      release: `Chia-Dashboard-Core@${version}`,
      integrations: [
        new Integrations.Dedupe(),
        new Integrations.ExtraErrorData(),
        new Integrations.Transaction(),
      ],
      ignoreErrors: [
        'Parse Error',
        'request aborted',
      ],
    });
  }

  captureException(err) {
    if (!config.sentryDsn) {
      return;
    }

    Sentry.captureException(err);
  }
}

module.exports = new SentryService();
