const coinGecko = require('./coin-gecko');
const logger = require('./logger');

class RateService {
  constructor() {
    this.rates = {};
    this.currencies = [];
  }

  async init() {
    await this.updateCurrencies();
    await this.updateRates();
    setInterval(this.updateCurrencies.bind(this), 60 * 60 * 1000);
    setInterval(this.updateRates.bind(this), 10 * 60 * 1000);
  }

  async updateCurrencies() {
    try {
      this.currencies = await coinGecko.getCurrencies();
    } catch (error) {
      logger.log({level: 'error', msg: `RateService | Failed to update currencies: ${error}`});
    }
  }

  async updateRates() {
    try {
      this.rates = await coinGecko.getRates({ ticker: 'chia', fiatCurrencies: this.currencies });
    } catch (error) {
      logger.log({level: 'error', msg: `RateService | Failed to update rates: ${error}`});
    }
  }
}

module.exports = new RateService();
