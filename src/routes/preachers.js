import {
  getAll, getOne, createOne, updateOne, deleteOne,
} from '../models/Preachers';

const jwt = require('jsonwebtoken');
const Router = require('koa-router');

export const router = new Router({ prefix: '/preachers' });

async function authorize(ctx, next) {
  if (!(ctx.request.method === 'GET' && /\/preachers\/./.test(ctx.request.URL.pathname))) {
    const token = ctx.headers.authorization;
    try {
      jwt.verify(token, process.env.SECRET);
    } catch (err) {
      ctx.set('X-Status-Reason', err.message);
      ctx.throw(401, 'Not Authorized');
    }
  }
  await next();
}

router.use(authorize);

router
  .get('/', async (ctx, next) => {
    try {
      ctx.body = await getAll();
    } catch (err) {
      ctx.throw(404, 'No information!');
    }

    next();
  })
  .get('/:id', async (ctx, next) => {
    try {
      ctx.body = await getOne(ctx.params.id);
    } catch (err) {
      ctx.throw(404, 'Cannot find preacher!');
    }

    next();
  })
  .post('/create', async (ctx, next) => {
    try {
      ctx.body = await createOne(ctx.request.body);
    } catch (err) {
      ctx.throw(500, 'Cannot create preacher!');
    }

    next();
  })
  .put('/:id', async (ctx, next) => {
    try {
      ctx.body = await updateOne(ctx.params.id, ctx.request.body);
    } catch (err) {
      ctx.throw(500, 'Cannot update preacher!');
    }

    next();
  })
  .delete('/:id', async (ctx, next) => {
    try {
      await deleteOne(ctx.params.id);
      ctx.body = { id: ctx.params.id };
    } catch (err) {
      if (err.name) {
        ctx.throw(500, 'Cannot delete preacher because it is connected to the seminar!');
      } else {
        ctx.throw(500, 'Cannot delete preacher!');
      }
    }

    next();
  });
