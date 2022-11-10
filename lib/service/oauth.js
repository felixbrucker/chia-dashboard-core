const { Types } = require('mongoose')

const User = require('./db/user');
const RefreshToken = require('./db/refresh-token');
const db = require('./db');
const logger = require('./logger');
const jwt = require('./jwt');
const config = require('./config');
const Discord = require('../oauth-provider/discord');
const Github = require('../oauth-provider/github');
const Google = require('../oauth-provider/google');

class OAuth {
  constructor() {
    this.isDiscordBeingRateLimited = false
  }

  async init() {
    await db.init();

    logger.log({level: 'info', msg: `OAuth | Initialized`});
  }

  async authenticate(body) {
    switch (body.grant_type) {
      case 'discord_auth_code':
        if (!config.discord.clientId || !config.discord.clientSecret) {
          throw new Error(`Grant type ${body.grant_type} is not configured`);
        }
        if (this.isDiscordBeingRateLimited) {
          throw new Error('Can not authenticate with discord right now because of too many requests, please retry later.')
        }
        try {
          return await this.onOAuthProviderAuthCode(new Discord(), body)
        } catch (err) {
          if (err.response && err.response.status === 429) {
            const responseData = err.response && err.response.data
            const retryAfter = responseData && responseData.retry_after || 10 * 60
            logger.log({level: 'info', msg: `OAuth | Discord | Rate limiting ourselves for ${retryAfter} seconds`})
            this.isDiscordBeingRateLimited = true
            setTimeout(() => this.isDiscordBeingRateLimited = false, retryAfter * 1000)
          } else {
            const responseData = err.response && err.response.data
            logger.log({level: 'debug', msg: `OAuth | Discord | Encountered an unknown error while authenticating: ${err.message} (${responseData})`})
          }

          throw err
        }
      case 'github_auth_code':
        if (!config.github.clientId || !config.github.clientSecret) {
          throw new Error(`Grant type ${body.grant_type} is not configured`);
        }
        return this.onOAuthProviderAuthCode(new Github(), body);
      case 'google_auth_code':
        if (!config.google.clientId || !config.google.clientSecret) {
          throw new Error(`Grant type ${body.grant_type} is not configured`);
        }
        return this.onOAuthProviderAuthCode(new Google(), body);
      case 'refresh_token': return this.onRefreshToken(body.refresh_token);
      default: throw new Error(`Unsupported grant type: ${body.grant_type}`);
    }
  }

  async onRefreshToken(refreshToken) {
    const { userId } = await jwt.decodeRefreshToken(refreshToken);
    const refreshTokenOnDb = await RefreshToken.findOne({
      token: refreshToken,
      user: new Types.ObjectId(userId),
    })
    if (!refreshTokenOnDb) {
      throw new Error('Expired token');
    }
    await RefreshToken.deleteOne({ _id: refreshTokenOnDb._id })
    const newRefreshToken = await jwt.makeRefreshToken({ userId });
    const newRefreshTokenOnDb = new RefreshToken({
      token: newRefreshToken,
      user: new Types.ObjectId(userId),
    })
    await newRefreshTokenOnDb.save();

    return {
      accessToken: await jwt.makeAccessToken({ userId }),
      refreshToken: newRefreshToken,
    };
  }

  async onOAuthProviderAuthCode(oAuthProvider, body) {
    await oAuthProvider.authenticate(body);
    const userInfo = await oAuthProvider.getUserInfo();
    const user = await this.upsertUserFromUserInfo(userInfo, oAuthProvider.name);
    const refreshToken = await jwt.makeRefreshToken({ userId: user.id.toString() });
    const refreshTokenOnDb = new RefreshToken({
      token: refreshToken,
      user: user._id,
    })
    await refreshTokenOnDb.save();

    return {
      accessToken: await jwt.makeAccessToken({ userId: user.id.toString() }),
      refreshToken,
    };
  }

  async upsertUserFromUserInfo(userInfo, identityProviderName) {
    let user = await User.findOne({
      'identityProvider.kind': identityProviderName,
      'identityProvider.user.id': userInfo.id,
    });
    if (user) {
      let updated = false;
      if (user.username !== userInfo.username) {
        user.username = userInfo.username;
        updated = true;
      }
      if (user.email !== userInfo.email) {
        user.email = userInfo.email;
        updated = true;
      }
      if (user.avatarUrl !== userInfo.avatarUrl) {
        user.avatarUrl = userInfo.avatarUrl;
        updated = true;
      }
      if (user.firstName !== userInfo.firstName) {
        user.firstName = userInfo.firstName;
        updated = true;
      }
      if (user.lastName !== userInfo.lastName) {
        user.lastName = userInfo.lastName;
        updated = true;
      }
      if (updated) {
        await user.save();
      }

      return user;
    }
    if (config.disableSingup) {
      throw new Error('New user signup is currently disabled');
    }

    user = new User({
      username: userInfo.username,
      email: userInfo.email,
      avatarUrl: userInfo.avatarUrl,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      identityProvider: {
        kind: identityProviderName,
        user: {
          id: userInfo.id,
        },
      },
    });
    await user.save();

    return user;
  }
}

module.exports = new OAuth();
