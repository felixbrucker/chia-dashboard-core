const migrateSatellites = require('./migrate-satellites');
const migrateRefreshTokens = require('./migrate-refresh-tokens');
const config = require('../service/config');

module.exports = {
  migrate: async () => {
    if (!config.isMaster) {
      return;
    }
    await migrateSatellites();
    await migrateRefreshTokens();
  },
};
