const coinGecko = require('./coin-gecko');

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
    this.currencies = await coinGecko.getCurrencies();
  }

  async updateRates() {
    this.rates = await coinGecko.getRates({ ticker: 'chia', fiatCurrencies: this.currencies });
  }
}

module.exports = new RateService();
