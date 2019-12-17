import Router from 'koa-router';

export const router = new Router();

router
  .get('/', (ctx) => {
    ctx.body = { result: 'success' };
  })
  .all('/', (ctx) => {
    ctx.body = { result: 'success' };
  })
  .get('/favicon.ico', (ctx) => {
    ctx.body = { result: 'success' };
  })
  .all('/favicon.ico', (ctx) => {
    ctx.body = { result: 'success' };
  });
