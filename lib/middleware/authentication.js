const jwt = require('../service/jwt');
const User = require('../service/db/user');

module.exports = ({ fetchUser }) => {
  return async (ctx, next) => {
    if (!ctx.header || !ctx.header.authorization) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        error: 'No authorization header provided',
      };

      return;
    }

    const parts = ctx.header.authorization.split(' ');
    if (parts.length !== 2) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        error: 'Invalid authorization header provided',
      };

      return;
    }

    const scheme = parts[0];
    if (!(/^Bearer$/i.test(scheme))) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        error: 'Invalid authorization header provided',
      };

      return;
    }

    const token = parts[1];
    try {
      const { userId } = await jwt.decodeAccessToken(token);
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
