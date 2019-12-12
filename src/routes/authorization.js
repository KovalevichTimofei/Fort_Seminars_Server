const Router = require('koa-router');
const jwt = require('jsonwebtoken');

const secret = process.env.SECRET;

export const router = new Router({ prefix: '/auth' });

router
  .post('/signin', async (ctx, next) => {
    const headerAndPayload = ctx.request.body;

    const token = jwt.sign(headerAndPayload, secret);
    console.log(token);
    ctx.body = { token };

    next();
  });
