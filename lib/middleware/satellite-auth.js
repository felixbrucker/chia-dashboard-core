const Satellite = require('../service/db/satellite');

module.exports = async (ctx, next) => {
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
    const satellite = await Satellite.findOne({ apiKey: token });
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
