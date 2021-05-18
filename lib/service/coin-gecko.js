const axios = require('axios');

class CoinGecko {
  constructor() {
    this.client = axios.create({ baseURL: 'https://api.coingecko.com/api/v3' });
  }

  async getRates({ ticker, fiatCurrencies }) {
    const rate = await this.doApiCall('simple/price', {
      vs_currencies: fiatCurrencies.join(','),
      ids: ticker,
      include_24hr_change: true,
    });
    if (!rate || !rate[ticker]) {
      throw new Error(`No rates found for ticker ${ticker}`);
    }

    return rate[ticker];
  }

  async getCurrencies() {
    return this.doApiCall('simple/supported_vs_currencies');
  }

  async doApiCall(url, params = {}) {
    const { data } = await this.client.get(url, { params });

    return data;
  }
}

module.exports = new CoinGecko();
