import Router from 'koa-router';

export const router = new Router();

router
  .get('/', (ctx, next) => {
    ctx.body = { result: 'success' };
    next();
  })
  .all('/', (ctx, next) => {
    ctx.body = { result: 'success' };
    next();
  })
  .get('/favicon.ico', (ctx, next) => {
    ctx.body = { result: 'success' };
    next();
  })
  .all('/favicon.ico', (ctx, next) => {
    ctx.body = { result: 'success' };
    next();
  });
