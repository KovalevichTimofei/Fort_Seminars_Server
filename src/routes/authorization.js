const Router = require('koa-router');
const jwt = require('jsonwebtoken');

const secret = process.env.SECRET;

export const router = new Router({ prefix: '/auth' });

router
  .post('/signin', async (ctx) => {
    const { header, payload } = ctx.request.body;

    if (
      payload.login === process.env.ADMIN_LOGIN
      && payload.password === process.env.ADMIN_PASSWORD
    ) {
      ctx.body = { token: jwt.sign({ header, payload }, secret) };
    } else {
      ctx.throw(401, 'Login or password is incorrect!');
    }
  });
