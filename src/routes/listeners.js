import Router from 'koa-router';
import { authorize, isEmpty, getUndefinedFields } from '../plugins';

import {
  createOne, deleteOne, getAll, getOne, updateOne,
} from '../models/Listeners';

export const router = new Router({ prefix: '/listeners' });

router.use(authorize);

router
  .get('/:id', async (ctx) => {
    try {
      ctx.body = await getOne(ctx.params.id);
    } catch (err) {
      ctx.throw(404, 'Cannot find listener!');
    }
  })
  .post('/', async (ctx) => {
    try {
      ctx.body = await getAll(ctx.request.body);
    } catch (err) {
      ctx.throw(404, 'No information!');
    }
  })
  .post('/create', async (ctx) => {
    const emptyFields = getUndefinedFields(ctx.request.body, ['ifo', 'email']);

    if (emptyFields) {
      ctx.throw(400, `This fields are missed: ${emptyFields}`);
    }

    try {
      ctx.body = await createOne(ctx.request.body);
    } catch (err) {
      ctx.throw(500, 'Cannot create listener!');
    }
  })
  .put('/:id', async (ctx) => {
    if (isEmpty(ctx.request.body)) {
      ctx.throw(400, 'Empty body');
    }

    try {
      ctx.body = await updateOne(ctx.params.id, ctx.request.body);
    } catch (err) {
      ctx.throw(500, 'Cannot update listener!');
    }
  })
  .delete('/:id', async (ctx) => {
    try {
      await deleteOne(ctx.params.id);
      ctx.body = { id: ctx.params.id };
    } catch (err) {
      ctx.throw(500, 'Cannot delete listener!');
    }
  });
