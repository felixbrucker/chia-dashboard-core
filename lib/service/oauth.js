const User = require('./db/user');
const db = require('./db');
const logger = require('./logger');
const jwt = require('./jwt');
const config = require('./config');
const Discord = require('../oauth-provider/discord');
const Github = require('../oauth-provider/github');
const Google = require('../oauth-provider/google');

class OAuth {
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
        return this.onOAuthProviderAuthCode(new Discord(), body);
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
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const hasRefreshToken = user.refreshTokens.some(({ token }) => token === refreshToken);
    if (!hasRefreshToken) {
      throw new Error('Expired token');
    }
    user.refreshTokens = user.refreshTokens.filter(({ token }) => token !== refreshToken);
    const newRefreshToken = await jwt.makeRefreshToken({ user });
    user.refreshTokens.push({
      token: newRefreshToken,
      issuedAt: new Date(),
    });
    await user.save();

    return {
      accessToken: await jwt.makeAccessToken({ user }),
      refreshToken: newRefreshToken,
    };
  }

  async onOAuthProviderAuthCode(oAuthProvider, body) {
    await oAuthProvider.authenticate(body);
    const userInfo = await oAuthProvider.getUserInfo();
    const user = await this.upsertUserFromUserInfo(userInfo, oAuthProvider.name);
    const refreshToken = await jwt.makeRefreshToken({ user });
    user.refreshTokens.push({
      token: refreshToken,
      issuedAt: new Date(),
    });
    await user.save();

    return {
      accessToken: await jwt.makeAccessToken({ user }),
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

    user = new User({
      username: userInfo.username,
      email: userInfo.email,
      avatarUrl: userInfo.avatarUrl,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      refreshTokens: [],
      satellites: [],
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
