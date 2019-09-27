import {
  createOne, deleteOne, getByMonth, getAll, getOne, updateOne,
} from '../models/Lessons';

const Router = require('koa-router');

export const router = new Router({ prefix: '/lessons' });

router
  .get('/', async (ctx, next) => {
    ctx.body = await getAll();
    next();
  })
  .get('/:id', async (ctx, next) => {
    ctx.body = await getOne(ctx.params.id);
    next();
  })
  .get('/month/:number', async (ctx, next) => {
    console.log(await getByMonth(9));
    const result = await getByMonth(ctx.params.number);
    ctx.body = result.length ? result : [{ info: 'В этом месяце нет семинаров' }];
    next();
  })
  .post('/create', async (ctx, next) => {
    ctx.body = await createOne(ctx.request.body);
    next();
  })
  .put('/:id', async (ctx, next) => {
    ctx.body = await updateOne(ctx.params.id, ctx.request.body);
    next();
  })
  .delete('/:id', async (ctx, next) => {
    ctx.body = await deleteOne(ctx.params.id);
    next();
  });
