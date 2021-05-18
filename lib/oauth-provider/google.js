const axios = require('axios');
const qs = require('qs');

const config = require('../service/config');

class Google {
  get name() {
    return 'google';
  }

  constructor() {
    this.accessToken = null;

    this.client = this.makeClient();
  }

  async authenticate({ code, redirectUri }) {
    const { data } = await this.client.post('https://oauth2.googleapis.com/token', qs.stringify({
      client_id: config.google.clientId,
      client_secret: config.google.clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      code,
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      noToken: true,
    });

    this.accessToken = data.access_token;
  }

  async getUserInfo() {
    const { data } = await this.client.get('oauth2/v3/userinfo');

    return {
      id: data.sub,
      firstName: data.given_name,
      lastName: data.family_name,
      avatarUrl: data.picture,
      email: data.email,
      username: null,
    };
  }

  makeClient() {
    const client = axios.create({
      baseURL: 'https://www.googleapis.com',
    });
    client.interceptors.request.use(
      (config) => {
        if (!config.noToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    return client;
  }
}

module.exports = Google;
