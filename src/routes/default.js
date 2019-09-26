import Router from 'koa-router';

export const router = new Router();

router
  .all('/', (ctx, next) => {
    ctx.body = { result: 'success' };
    next();
  })
  .get('/favicon.ico', (ctx, next) => {
    ctx.body = { result: 'success' };
    next();
  });
