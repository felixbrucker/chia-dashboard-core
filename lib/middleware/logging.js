const logger = require('../service/logger');

module.exports = async (ctx, next) => {
  const start = Date.now();
  const message = `${ctx.method} ${ctx.url}`;
  let error = false;
  try {
    await next();
  } catch (err) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Unexpected error occurred',
    };
    error = err;
  } finally {
    if (!error) {
      logger.log({level: 'trace', msg: `HTTP | ${(Date.now()-start).toString().padStart(5, ' ')} ms | [${ctx.realIp}] | ${ctx.status} ${message}`});
    } else {
      logger.log({level: 'error', msg: `HTTP | ${(Date.now()-start).toString().padStart(5, ' ')} ms | [${ctx.realIp}] | ${ctx.status} ${message} | Error: ${error}`});
    }
  }
};
