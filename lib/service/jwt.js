const { sign, verify } = require('jsonwebtoken');

const config = require('./config');

const AUDIENCE = {
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
};

class Jwt {
  async sign({ payload, audience = AUDIENCE.accessToken, expiresIn }) {
    return new Promise((resolve, reject) => sign(payload, config.jwtSigningSecret, {
      expiresIn,
      audience,
    }, (err, token) => {
      if (err) {
        return reject(err);
      }

      resolve(token);
    }));
  }

  async decode({ token, audience = AUDIENCE.accessToken }) {
    return new Promise((resolve, reject) => verify(token, config.jwtSigningSecret, {
      audience,
    }, (err, decoded) => {
      if (err) {
        return reject(err);
      }

      resolve(decoded);
    }));
  }

  async makeAccessToken({ userId }) {
    return this.sign({ payload: { userId }, audience: AUDIENCE.accessToken, expiresIn: '10m' });
  }

  async makeRefreshToken({ userId }) {
    return this.sign({ payload: { userId }, audience: AUDIENCE.refreshToken, expiresIn: '7d' });
  }

  async decodeAccessToken(accessToken) {
    return this.decode({ token: accessToken, audience: AUDIENCE.accessToken });
  }

  async decodeRefreshToken(refreshToken) {
    return this.decode({ token: refreshToken, audience: AUDIENCE.refreshToken });
  }
}

module.exports = new Jwt();
