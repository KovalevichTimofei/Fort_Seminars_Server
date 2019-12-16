const Router = require('koa-router');
const jwt = require('jsonwebtoken');

const secret = process.env.SECRET;

export const router = new Router({ prefix: '/auth' });

router
  .post('/signin', async (ctx, next) => {
    const { header, payload } = ctx.request.body;

    if (payload.login === 'AlexStankevich@Powerful' && payload.password === '36545fktrcfylh') {
      ctx.body = { token: jwt.sign({ header, payload }, secret) };
    } else {
      ctx.throw(401, 'Login or password is incorrect!');
    }

    next();
  });
