const Satellite = require('../service/db/satellite');
const { extractBearerToken } = require('./auth-util');

module.exports = async (ctx, next) => {
  const apiKey = extractBearerToken(ctx);
  if (!apiKey) {
    return;
  }
  try {
    const satellite = await Satellite.findOne({ apiKey }).select({ _id: 1, version: 1 });
    if (!satellite) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        error: 'Invalid authorization header provided',
      };

      return;
    }
    ctx.satellite = satellite;
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
