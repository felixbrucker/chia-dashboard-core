module.exports = async (ctx, next) => {
  ctx.realIp = ctx.req.headers['cf-connecting-ip'] || ctx.req.headers['x-real-ip'] || ctx.req.headers['x-forwarded-for'] || ctx.request.ip;
  await next();
};
