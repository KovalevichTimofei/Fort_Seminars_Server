import Router from 'koa-router';
import { authorize, isEmpty } from '../plugins';

import {
  getAll, createOne, updateOne, deleteOne,
} from '../models/Preachers';

export const router = new Router({ prefix: '/preachers' });

router.use(authorize);

router
  .get('/', async (ctx) => {
    try {
      ctx.body = await getAll();
    } catch (err) {
      ctx.throw(404, 'No information!');
    }
  })
  .post('/create', async (ctx) => {
    if (!ctx.request.body.ifo) {
      ctx.throw(400, 'This fields are missed: ifo');
    }

    try {
      ctx.body = await createOne(ctx.request.body);
    } catch (err) {
      ctx.throw(500, 'Cannot create preacher!');
    }
  })
  .put('/:id', async (ctx) => {
    if (isEmpty(ctx.request.body)) {
      ctx.throw(400, 'Empty body');
    }

    try {
      ctx.body = await updateOne(ctx.params.id, ctx.request.body);
    } catch (err) {
      ctx.throw(500, 'Cannot update preacher!');
    }
  })
  .delete('/:id', async (ctx) => {
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
  });
