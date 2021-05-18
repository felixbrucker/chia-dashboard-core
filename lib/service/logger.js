const moment = require('moment');

const config = require('./config');

class Logger {
  constructor({ logLevel }) {
    this.logLevel = logLevel;
  }

  log({level, msg}) {
    if (this.getLogLevelNumber(this.logLevel) < this.getLogLevelNumber(level)) {
      return;
    }
    const logLine = `${moment().format('YYYY-MM-DD HH:mm:ss.SSS')} [${level.toUpperCase()}] | ${msg}`;
    if (level === 'error') {
      console.error(logLine);
    } else {
      console.log(logLine);
    }
  }

  getLogLevelNumber(logLevel) {
    switch (logLevel) {
      case 'error': return 1;
      case 'info': return 2;
      case 'debug': return 3;
      case 'trace': return 4;
    }
  }
}

module.exports = new Logger({ logLevel: config.logLevel });
