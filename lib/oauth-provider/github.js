const axios = require('axios');
const qs = require('qs');

const config = require('../service/config');

class Github {
  get name() {
    return 'github';
  }

  constructor() {
    this.accessToken = null;

    this.client = this.makeClient();
  }

  async authenticate({ code, state, redirectUri }) {
    const { data } = await this.client.post('https://github.com/login/oauth/access_token', qs.stringify({
      client_id: config.github.clientId,
      client_secret: config.github.clientSecret,
      redirect_uri: redirectUri,
      code,
      state,
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
    const { data } = await this.client.get('user');
    const name = data.name;
    let firstName = name || null;
    let lastName = null;
    if (name && name.split(' ').length > 1) {
      firstName = name.split(' ')[0];
      lastName = name.split(' ').slice(1).join(' ');
    }

    return {
      id: data.id,
      firstName,
      lastName,
      avatarUrl: data.avatar_url,
      email: data.email,
      username: data.login,
    };
  }

  makeClient() {
    const client = axios.create({
      baseURL: 'https://api.github.com',
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

module.exports = Github;
