const {tunnel} = require('cloudflared')
const logger = require('./logger')

class CloudflareTunnel {
  constructor(token) {
    this.token = token
  }

  async init() {
    const { connections } = tunnel({ 'run': null, '--token': this.token })
    await Promise.all(connections)
    logger.log({level: 'info', msg: `Cloudflare-Tunnel | Initialized`})
  }
}

module.exports = CloudflareTunnel
