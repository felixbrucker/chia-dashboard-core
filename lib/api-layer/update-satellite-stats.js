module.exports = {
  apply: (service, stats) => {
    if (!stats) {
      return;
    }
    if (service === 'fullNode' && stats.fullNodeConnections !== undefined && stats.fullNodeConnectionsCount !== undefined) {
      delete stats.fullNodeConnections;
    }
    if (service === 'harvester' && stats.farmerConnections !== undefined && stats.farmerConnectionsCount !== undefined) {
      delete stats.farmerConnections;
    }
    if (service === 'farmer' && stats.harvesterResponseTimes !== undefined && stats.averageHarvesterResponseTime !== undefined && stats.worstHarvesterResponseTime !== undefined) {
      delete stats.harvesterResponseTimes;
    }
  },
};
