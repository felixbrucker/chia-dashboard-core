const migrateSatellites = require('./migrate-satellites');
const config = require('../service/config');

module.exports = {
  migrate: async () => {
    if (!config.isMaster) {
      return;
    }
    await migrateSatellites();
  },
};
