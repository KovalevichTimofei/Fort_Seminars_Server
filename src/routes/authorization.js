import Router from 'koa-router';
import jwt from 'jsonwebtoken';

const secret = process.env.SECRET;

export const router = new Router({ prefix: '/auth' });

router
  .post('/signin', async (ctx) => {
    const { header, payload } = ctx.request.body;

    if (
      payload.login === process.env.ADMIN_LOGIN
      && payload.password === process.env.ADMIN_PASSWORD
    ) {
      ctx.body = {
        token: jwt.sign({ header, payload }, secret),
        refreshToken: jwt.sign({
          header: {
            ...header,
            refresh: true,
          },
          payload,
        }, secret),
      };
    } else {
      ctx.throw(401, 'Login or password is incorrect!');
    }
  })
  .post('/refresh', async (ctx) => {
    const { refreshToken } = ctx.request.body;

    try {
      const { header, payload } = jwt.verify(refreshToken, process.env.SECRET);

      ctx.body = {
        token: jwt.sign({ header, payload }, secret),
        refreshToken: jwt.sign({
          header: {
            ...header,
            refresh: true,
          },
          payload,
        }, secret),
      };
    } catch (err) {
      ctx.throw(401, 'Invalid token!');
    }
  });
