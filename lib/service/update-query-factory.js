const ServiceType = require('../service-type')

class UpdateQueryFactory {
  makeUpdateQuery(service, stats) {
    switch (service) {
      case ServiceType.daemon: return this.makeDaemonUpdateQuery(stats)
      case ServiceType.farmer: return this.makeFarmerUpdateQuery(stats)
      case ServiceType.fullNode: return this.makeFullNodeUpdateQuery(stats)
      case ServiceType.plotter: return this.makePlotterUpdateQuery(stats)
      case ServiceType.harvester: return this.makeHarvesterUpdateQuery(stats)
      case ServiceType.wallet: return this.makeWalletUpdateQuery(stats)
    }
  }

  makeDaemonUpdateQuery(stats) {
    const updateQuery = {}
    if (stats.version !== undefined) {
      updateQuery['services.daemon.stats.version'] = stats.version
    }

    return updateQuery
  }

  makeFarmerUpdateQuery(stats) {
    const updateQuery = {}
    if (stats.averageHarvesterResponseTime !== undefined) {
      updateQuery['services.farmer.stats.averageHarvesterResponseTime'] = stats.averageHarvesterResponseTime
    }
    if (stats.worstHarvesterResponseTime !== undefined) {
      updateQuery['services.farmer.stats.worstHarvesterResponseTime'] = stats.worstHarvesterResponseTime
    }
    if (stats.farmingInfos !== undefined) {
      updateQuery['services.farmer.stats.farmingInfos'] = stats.farmingInfos
    }
    if (stats.nodeId !== undefined) {
      updateQuery['services.farmer.stats.nodeId'] = stats.nodeId
    }

    return updateQuery
  }

  makeFullNodeUpdateQuery(stats) {
    const updateQuery = {}
    if (stats.blockchainState !== undefined) {
      if (stats.blockchainState.difficulty !== undefined) {
        updateQuery['services.fullNode.stats.blockchainState.difficulty'] = stats.blockchainState.difficulty
      }
      if (stats.blockchainState.spaceInGib !== undefined) {
        updateQuery['services.fullNode.stats.blockchainState.spaceInGib'] = stats.blockchainState.spaceInGib
      }
      if (stats.blockchainState.syncStatus !== undefined) {
        if (stats.blockchainState.syncStatus.synced !== undefined) {
          updateQuery['services.fullNode.stats.blockchainState.syncStatus.synced'] = stats.blockchainState.syncStatus.synced
        }
        if (stats.blockchainState.syncStatus.syncing !== undefined) {
          updateQuery['services.fullNode.stats.blockchainState.syncStatus.syncing'] = stats.blockchainState.syncStatus.syncing
        }
        if (stats.blockchainState.syncStatus.syncedHeight !== undefined) {
          updateQuery['services.fullNode.stats.blockchainState.syncStatus.syncedHeight'] = stats.blockchainState.syncStatus.syncedHeight
        }
        if (stats.blockchainState.syncStatus.tipHeight !== undefined) {
          updateQuery['services.fullNode.stats.blockchainState.syncStatus.tipHeight'] = stats.blockchainState.syncStatus.tipHeight
        }
      }
    }
    if (stats.fullNodeConnectionsCount !== undefined) {
      updateQuery['services.fullNode.stats.fullNodeConnectionsCount'] = stats.fullNodeConnectionsCount
    }

    return updateQuery
  }

  makePlotterUpdateQuery(stats) {
    const updateQuery = {}
    if (stats.completedPlotsToday !== undefined) {
      updateQuery['services.plotter.stats.completedPlotsToday'] = stats.completedPlotsToday
    }
    if (stats.completedPlotsYesterday !== undefined) {
      updateQuery['services.plotter.stats.completedPlotsYesterday'] = stats.completedPlotsYesterday
    }
    if (stats.jobs !== undefined) {
      updateQuery['services.plotter.stats.jobs'] = stats.jobs
    }

    return updateQuery
  }

  makeHarvesterUpdateQuery(stats) {
    const updateQuery = {}
    if (stats.ogPlots !== undefined) {
      if (stats.ogPlots.count !== undefined) {
        updateQuery['services.harvester.stats.ogPlots.count'] = stats.ogPlots.count
      }
      if (stats.ogPlots.rawCapacityInGib !== undefined) {
        updateQuery['services.harvester.stats.ogPlots.rawCapacityInGib'] = stats.ogPlots.rawCapacityInGib
      }
      if (stats.ogPlots.effectiveCapacityInGib !== undefined) {
        updateQuery['services.harvester.stats.ogPlots.effectiveCapacityInGib'] = stats.ogPlots.effectiveCapacityInGib
      }
    }
    if (stats.nftPlots !== undefined) {
      if (stats.nftPlots.count !== undefined) {
        updateQuery['services.harvester.stats.nftPlots.count'] = stats.nftPlots.count
      }
      if (stats.nftPlots.rawCapacityInGib !== undefined) {
        updateQuery['services.harvester.stats.nftPlots.rawCapacityInGib'] = stats.nftPlots.rawCapacityInGib
      }
      if (stats.nftPlots.effectiveCapacityInGib !== undefined) {
        updateQuery['services.harvester.stats.nftPlots.effectiveCapacityInGib'] = stats.nftPlots.effectiveCapacityInGib
      }
    }
    if (stats.plotCount !== undefined) {
      updateQuery['services.harvester.stats.plotCount'] = stats.plotCount
    }
    if (stats.totalRawPlotCapacityInGib !== undefined) {
      updateQuery['services.harvester.stats.totalRawPlotCapacityInGib'] = stats.totalRawPlotCapacityInGib
    }
    if (stats.totalEffectivePlotCapacityInGib !== undefined) {
      updateQuery['services.harvester.stats.totalEffectivePlotCapacityInGib'] = stats.totalEffectivePlotCapacityInGib
    }
    if (stats.farmerConnectionsCount !== undefined) {
      updateQuery['services.harvester.stats.farmerConnectionsCount'] = stats.farmerConnectionsCount
    }
    if (stats.nodeId !== undefined) {
      updateQuery['services.harvester.stats.nodeId'] = stats.nodeId
    }

    return updateQuery
  }

  makeWalletUpdateQuery(stats) {
    const updateQuery = {}
    if (stats.wallets !== undefined) {
      updateQuery['services.wallet.stats.wallets'] = stats.wallets
    }
    if (stats.syncStatus !== undefined) {
      if (stats.syncStatus.synced !== undefined) {
        updateQuery['services.wallet.stats.syncStatus.synced'] = stats.syncStatus.synced
      }
      if (stats.syncStatus.syncing !== undefined) {
        updateQuery['services.wallet.stats.syncStatus.syncing'] = stats.syncStatus.syncing
      }
      if (stats.syncStatus.syncedHeight !== undefined) {
        updateQuery['services.wallet.stats.syncStatus.syncedHeight'] = stats.syncStatus.syncedHeight
      }
    }
    if (stats.farmedAmount !== undefined) {
      updateQuery['services.wallet.stats.farmedAmount'] = stats.farmedAmount
    }
    if (stats.fingerprint !== undefined) {
      updateQuery['services.wallet.stats.fingerprint'] = stats.fingerprint
    }

    return updateQuery
  }
}

module.exports = new UpdateQueryFactory()
