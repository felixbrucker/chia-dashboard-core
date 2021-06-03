const logger = require('../service/logger');
const Satellite = require('../service/db/satellite');

module.exports = async () => {
  await migrateFullNodeConnections();
  await migrateFarmerConnections();
  await migrateHarvesterResponseTimes();
};

const migrateFullNodeConnections = async () => {
  const satellitesToMigrate = await Satellite.find({
    'services.fullNode.stats.fullNodeConnections': { $exists: true },
    'services.fullNode.stats.fullNodeConnectionsCount': { $exists: true },
  });
  if (satellitesToMigrate.length > 0) {
    logger.log({level: 'info', msg: `Migrations | Satellites | fullNodeConnections | Migrating ${satellitesToMigrate.length} satellites ..`});
  }
  for (let satellite of satellitesToMigrate) {
    delete satellite.services.fullNode.stats.fullNodeConnections;
    satellite.markModified('services.fullNode.stats');
    await satellite.save();
  }
};

const migrateFarmerConnections = async () => {
  const satellitesToMigrate = await Satellite.find({
    'services.harvester.stats.farmerConnections': { $exists: true },
    'services.harvester.stats.farmerConnectionsCount': { $exists: true },
  });
  if (satellitesToMigrate.length > 0) {
    logger.log({level: 'info', msg: `Migrations | Satellites | farmerConnections | Migrating ${satellitesToMigrate.length} satellites ..`});
  }
  for (let satellite of satellitesToMigrate) {
    delete satellite.services.harvester.stats.farmerConnections;
    satellite.markModified('services.harvester.stats');
    await satellite.save();
  }
};

const migrateHarvesterResponseTimes = async () => {
  const satellitesToMigrate = await Satellite.find({
    'services.farmer.stats.harvesterResponseTimes': { $exists: true },
    'services.farmer.stats.averageHarvesterResponseTime': { $exists: true },
    'services.farmer.stats.worstHarvesterResponseTime': { $exists: true },
  });
  if (satellitesToMigrate.length > 0) {
    logger.log({level: 'info', msg: `Migrations | Satellites | harvesterResponseTimes | Migrating ${satellitesToMigrate.length} satellites ..`});
  }
  for (let satellite of satellitesToMigrate) {
    delete satellite.services.farmer.stats.harvesterResponseTimes;
    satellite.markModified('services.farmer.stats');
    await satellite.save();
  }
};
