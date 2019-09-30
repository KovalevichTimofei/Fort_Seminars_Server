import {
  getAll, getOne, createOne, updateOne, deleteOne,
} from '../models/Seminars';
import { getFirstFutureLesson, getAllForCurrentSeminar } from '../models/Lessons';

const Router = require('koa-router');

export const router = new Router({ prefix: '/seminars' });

function getPrettyDate(date) {
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
}

router
  .get('/', async (ctx, next) => {
    ctx.body = await getAll();
    next();
  })
  .get('/current', async (ctx, next) => {
    const seminarId = (await getFirstFutureLesson()).seminar_id;
    const seminarLessons = (await getAllForCurrentSeminar(seminarId));
    const seminarPeriod = `${getPrettyDate(seminarLessons[0].date)} - ${getPrettyDate(seminarLessons[seminarLessons.length - 1].date)}`;
    const currentSeminar = await getOne(seminarId);
    ctx.body = { ...currentSeminar.dataValues, period: seminarPeriod };
    next();
  })
  .get('/:id', async (ctx, next) => {
    if (!isNaN(ctx.params.id)) {
      ctx.body = await getOne(ctx.params.id);
      next();
    }
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
