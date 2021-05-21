const User = require('../service/db/user');
const { extractBearerToken } = require('./auth-util');

module.exports = async (ctx, next) => {
  const shareKey = extractBearerToken(ctx);
  if (!shareKey) {
    return;
  }
  try {
    const user = await User.findOne({ shareKey });
    if (!user) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        error: 'Invalid authorization header provided',
      };

      return;
    }
    ctx.user = user;
    ctx.userId = user.id.toString();
  } catch (err) {
    ctx.status = 401;
    ctx.body = {
      success: false,
      error: 'Invalid authorization header provided',
    };
    return;
  }
  await next();
};
