const FastRateLimit = require('@kidkarolis/not-so-fast');

module.exports = (rateLimitOptions) => {
  const rateLimiter = new FastRateLimit(rateLimitOptions);

  return async (ctx, next) => {
    try {
      await rateLimiter.consume(ctx.realIp);
    } catch (err) {
      ctx.status = 429;

      return;
    }
    await next();
  };
};
