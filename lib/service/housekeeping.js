const moment = require('moment');

const User = require('./db/user');
const db = require('./db');
const logger = require('./logger');
const jwt = require('./jwt');
const config = require('./config');

class Housekeeping {
  async init() {
    if (!config.isMaster) {
      return;
    }

    await db.init();

    await this.removeExpiredRefreshTokens();
    setInterval(this.removeExpiredRefreshTokens.bind(this), 60 * 60 * 1000);

    logger.log({level: 'info', msg: `Housekeeping | Initialized`});
  }

  async removeExpiredRefreshTokens() {
    const usersWithExpiredRefreshTokens = await User.find({
      'refreshTokens.issuedAt': {
        $lt: moment().subtract(7, 'days').toDate(),
      },
    });
    let updatedUsers = 0;
    for (let user of usersWithExpiredRefreshTokens) {
      const validRefreshTokens = [];
      for (let refreshToken of user.refreshTokens) {
        try {
          await jwt.decodeRefreshToken(refreshToken.token);
          validRefreshTokens.push(refreshToken);
        } catch (err) {}
      }
      if (user.refreshTokens.length === validRefreshTokens.length) {
        continue;
      }
      user.refreshTokens = validRefreshTokens;
      await user.save();
      updatedUsers += 1;
    }
    if (updatedUsers > 0) {
      logger.log({level: 'info', msg: `Housekeeping | Removed expired refresh tokens for ${updatedUsers} users`});
    }
  }
}

module.exports = new Housekeeping();
