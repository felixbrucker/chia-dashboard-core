const jwt = require('../service/jwt');
const User = require('../service/db/user');
const { extractBearerToken } = require('./auth-util');

module.exports = ({ fetchUser }) => {
  return async (ctx, next) => {
    const accessToken = extractBearerToken(ctx);
    if (!accessToken) {
      return;
    }
    try {
      const { userId } = await jwt.decodeAccessToken(accessToken);
      ctx.userId = userId;
    } catch (err) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        error: 'Invalid authorization header provided',
      };
      return;
    }

    if (fetchUser) {
      try {
        const user = await User.findById(ctx.userId);
        if (!user) {
          ctx.status = 401;
          ctx.body = {
            success: false,
            error: 'Invalid authorization header provided',
          };

          return;
        }
        ctx.user = user;
      } catch (err) {
        ctx.status = 401;
        ctx.body = {
          success: false,
          error: 'Invalid authorization header provided',
        };
        return;
      }
    }

    await next();
  };
};
