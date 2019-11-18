import {
  createOne, deleteOne, getByMonth, getAllForCurrentSeminar, getAll, getOne, updateOne,
} from '../models/Lessons';
import {
  getOne as getSeminarById,
} from '../models/Seminars';

const Router = require('koa-router');

export const router = new Router({ prefix: '/lessons' });

router
  .get('/', async (ctx, next) => {
    const lessons = await getAll();
    const lessonsList = [];

    const promises = lessons.map(async (lesson) => {
      const seminar = await getSeminarById(lesson.seminar_id);
      const date = new Date(Date.parse(lesson.date));

      lessonsList.push({
        id: lesson.id,
        info: lesson.info,
        date: `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`,
        seminar_id: lesson.seminar_id,
        part_numb: lesson.part_numb,
        seminar: seminar.title,
      });
    });

    await Promise.all(promises);

    ctx.body = lessonsList;
    next();
  })
  .get('/:id', async (ctx, next) => {
    const lesson = await getOne(ctx.params.id);
    const date = { lesson };
    ctx.body = {
      ...lesson,
      date: `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`,
    };
    next();
  })
  .get('/month/:number', async (ctx, next) => {
    const result = await getByMonth(ctx.params.number);
    ctx.body = result.length ? result : [{ info: 'В этом месяце нет семинаров' }];
    next();
  })
  .get('/seminar/:seminarId', async (ctx, next) => {
    ctx.body = await getAllForCurrentSeminar(ctx.params.seminarId);
    next();
  })
  .post('/create', async (ctx, next) => {
    ctx.body = await createOne(ctx.request.body);
    next();
  })
  .put('/:id', async (ctx, next) => {
    const lesson = await updateOne(ctx.params.id, ctx.request.body);
    const seminar = await getSeminarById(lesson.seminar_id);
    lesson.dataValues.seminar = seminar.title;
    ctx.body = lesson;
    next();
  })
  .delete('/:id', async (ctx, next) => {
    ctx.body = await deleteOne(ctx.params.id);
    ctx.body = { id: ctx.params.id };
    next();
  });
