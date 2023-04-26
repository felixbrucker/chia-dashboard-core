const logger = require('../service/logger');
const Satellite = require('../service/db/satellite');

module.exports = async () => {
  await migrateFullNodeConnections();
  await migrateFarmerConnections();
  await migrateHarvesterResponseTimes();
  await migrateNullStats()
};

const migrateFullNodeConnections = async () => {
  const updateResult = await Satellite.updateMany({
    'services.fullNode.stats.fullNodeConnections': { $exists: true },
    'services.fullNode.stats.fullNodeConnectionsCount': { $exists: true },
  }, {
    $unset: { 'services.fullNode.stats.fullNodeConnections': null },
  }, {
    strict: false,
    strictQuery: false,
  })
  if (updateResult.modifiedCount > 0) {
    logger.log({level: 'info', msg: `Migrations | Satellites | fullNodeConnections | Migrated ${updateResult.modifiedCount} satellites ..`})
  }
};

const migrateFarmerConnections = async () => {
  const updateResult = await Satellite.updateMany({
    'services.harvester.stats.farmerConnections': { $exists: true },
    'services.harvester.stats.farmerConnectionsCount': { $exists: true },
  }, {
    $unset: { 'services.harvester.stats.farmerConnections': null },
  }, {
    strict: false,
    strictQuery: false,
  })
  if (updateResult.modifiedCount > 0) {
    logger.log({level: 'info', msg: `Migrations | Satellites | farmerConnections | Migrated ${updateResult.modifiedCount} satellites ..`})
  }
};

const migrateHarvesterResponseTimes = async () => {
  const updateResult = await Satellite.updateMany({
    'services.farmer.stats.harvesterResponseTimes': { $exists: true },
    'services.farmer.stats.averageHarvesterResponseTime': { $exists: true },
    'services.farmer.stats.worstHarvesterResponseTime': { $exists: true },
  }, {
    $unset: { 'services.farmer.stats.harvesterResponseTimes': null },
  }, {
    strict: false,
    strictQuery: false,
  })
  if (updateResult.modifiedCount > 0) {
    logger.log({level: 'info', msg: `Migrations | Satellites | harvesterResponseTimes | Migrated ${updateResult.modifiedCount} satellites ..`})
  }
}

const migrateNullStats = async () => {
  const updateResults = await Promise.all([
    Satellite.updateMany({ 'services.farmer.stats': null }, { $unset: { 'services.farmer.stats': null } }),
    Satellite.updateMany({ 'services.harvester.stats': null }, { $unset: { 'services.harvester.stats': null } }),
    Satellite.updateMany({ 'services.wallet.stats': null }, { $unset: { 'services.wallet.stats': null } }),
    Satellite.updateMany({ 'services.fullNode.stats': null }, { $unset: { 'services.fullNode.stats': null } }),
    Satellite.updateMany({ 'services.plotter.stats': null }, { $unset: { 'services.plotter.stats': null } }),
  ])
  const modifiedCount = updateResults.reduce((acc, curr) => acc + curr.modifiedCount, 0)
  if (modifiedCount > 0) {
    logger.log({level: 'info', msg: `Migrations | Satellites | nullStats | Updated ${modifiedCount} documents ..`})
  }
}
