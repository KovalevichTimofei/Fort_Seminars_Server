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
    const result = await getAll();

    if (result === 'fail') {
      ctx.throw(404, 'No information!');
    } else {
      ctx.body = result;
    }

    next();
  })
  .get('/:id', async (ctx, next) => {
    const result = await getOne(ctx.params.id);

    if (result === 'fail') {
      ctx.throw(404, 'Cannot find preacher!');
    } else {
      ctx.body = result;
    }

    next();
  })
  .post('/create', async (ctx, next) => {
    const result = await createOne(ctx.request.body);

    if (result === 'fail') {
      ctx.throw(500, 'Cannot create preacher!');
    } else {
      ctx.body = result;
    }

    next();
  })
  .put('/:id', async (ctx, next) => {
    const result = await updateOne(ctx.params.id, ctx.request.body);

    if (result === 'fail') {
      ctx.throw(500, 'Cannot update preacher!');
    } else {
      ctx.body = result;
    }

    next();
  })
  .delete('/:id', async (ctx, next) => {
    const result = await deleteOne(ctx.params.id);

    if (result === 'connected to seminar') {
      ctx.throw(500, 'Cannot delete preacher because it is connected to the seminar!');
    } else if (result === 'fail') {
      ctx.throw(500, 'Cannot delete preacher!');
    } else if (result === 'success') {
      ctx.body = { id: ctx.params.id };
    }

    next();
  });
