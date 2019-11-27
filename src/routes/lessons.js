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
    const lessons = await getAll()
      .catch(() => {
        ctx.throw(404, 'No information!');
        next();
      });
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

    await Promise.all(promises)
      .then(() => { ctx.body = lessonsList; })
      .catch(() => ctx.throw(404, 'No information!'));

    next();
  })
  .get('/:id', async (ctx, next) => {
    const result = await getOne(ctx.params.id);

    if (result === 'fail') {
      ctx.throw(404, 'Unable find lesson!');
    } else {
      const date = { result };
      ctx.body = {
        ...result,
        date: `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`,
      };
    }
    next();
  })
  .get('/month/:number', async (ctx, next) => {
    const result = await getByMonth(ctx.params.number);

    if (result === 'fail') {
      ctx.throw(404, 'Unable find lessons!');
    } else {
      ctx.body = result.length ? result : [{ info: 'В этом месяце нет семинаров' }];
    }

    next();
  })
  .get('/seminar/:seminarId', async (ctx, next) => {
    const result = await getAllForCurrentSeminar(ctx.params.seminarId);

    if (result === 'fail') {
      ctx.throw(404, 'Unable find lesson!');
    } else {
      ctx.body = result;
    }

    next();
  })
  .post('/create', async (ctx, next) => {
    const result = await createOne(ctx.request.body);

    if (result === 'fail') {
      ctx.throw(500, 'Unable create lesson!');
    } else {
      ctx.body = result;
    }

    next();
  })
  .put('/:id', async (ctx, next) => {
    const lesson = await updateOne(ctx.params.id, ctx.request.body);

    if (lesson === 'fail') {
      ctx.throw(500, 'Unable update lesson!');
    } else {
      const seminar = await getSeminarById(lesson.seminar_id);

      if (seminar === 'fail') {
        ctx.throw(500, 'Unable create lesson!');
      } else {
        lesson.seminar = seminar.title;
        ctx.body = lesson;
      }
    }

    next();
  })
  .delete('/:id', async (ctx, next) => {
    const result = await deleteOne(ctx.params.id);

    if (result === 'fail') {
      ctx.throw(500, 'Unable delete lesson!');
    } else {
      ctx.body = { id: ctx.params.id };
    }

    next();
  });
