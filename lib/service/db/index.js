const mongoose = require('mongoose');
const config = require('../config');
const logger = require('../logger');

class Database {
  constructor() {
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) {
      return;
    }
    await mongoose.connect(config.databaseUrl, {
      maxPoolSize: config.dbMaxPoolSize,
      autoIndex: true,
      readPreference: 'nearest',
    });
    mongoose.connection.on('error', err => logger.log({level: 'error', msg: `DB | Error: ${err}`}));
    this.isInitialized = true;
  }
}

module.exports = new Database();
