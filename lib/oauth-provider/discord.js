const axios = require('axios');
const qs = require('qs');
const BigNumber = require('bignumber.js');

const config = require('../service/config');

class Discord {
  get name() {
    return 'discord';
  }

  constructor() {
    this.accessToken = null;
    this.refreshToken = null;

    this.client = this.makeClient();
  }

  async authenticate({ code, redirectUri }) {
    const { data } = await this.client.post('oauth2/token', qs.stringify({
      client_id: config.discord.clientId,
      client_secret: config.discord.clientSecret,
      grant_type: 'authorization_code',
      scope: 'identify email',
      redirect_uri: redirectUri,
      code,
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      noToken: true,
    });

    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;
  }

  async getUserInfo() {
    if (config.allowedDiscordGuild) {
      const isDiscordGuildMember = await this.isMemberOfDiscordGuild(config.allowedDiscordGuild);
      if (!isDiscordGuildMember) {
        throw new Error('This dashboard is only available for certain discord members');
      }
    }

    const { data } = await this.client.get('users/@me');
    let avatarUrl;
    if (data.avatar) {
      avatarUrl = `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png`;
    } else {
      const embedNumber = parseInt(data.discriminator, 10) % 5;
      avatarUrl = `https://cdn.discordapp.com/embed/avatars/${embedNumber}.png`;
    }

    return {
      id: data.id,
      firstName: null,
      lastName: null,
      avatarUrl,
      email: data.email,
      username: data.username,
    };
  }

  async isMemberOfDiscordGuild(guildId) {
    const { data: guilds } = await this.client.get('users/@me/guilds', {
      params: {
        before: (new BigNumber(guildId)).plus(1).toString(),
      },
    });

    return guilds.some(guild => guild.id === guildId);
  }

  async refreshTokens() {
    const { data } = await this.client.post('oauth2/token', qs.stringify({
      client_id: config.discord.clientId,
      client_secret: config.discord.clientSecret,
      scope: 'identify email',
      grant_type: 'refresh_token',
      redirect_uri: 'http://localhost:3000/api/discord/authorize',
      refresh_token: this.refreshToken,
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      noToken: true,
    });

    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;
  }

  makeClient() {
    const client = axios.create({
      baseURL: 'https://discord.com/api',
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
    client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response.status !== 401 || error.config._retry) {
          return Promise.reject(error);
        }
        error.config._retry = true;
        await this.refreshTokens();

        return this.client(error.config);
      }
    );

    return client;
  }
}

module.exports = Discord;
