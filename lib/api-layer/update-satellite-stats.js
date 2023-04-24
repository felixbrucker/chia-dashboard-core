module.exports = {
  apply: (service, stats) => {
    if (service === 'farmer' && stats.farmingInfos !== undefined && stats.farmingInfos.length > 100) {
      stats.farmingInfos = stats.farmingInfos.slice(0, 100)
    }
  },
}
