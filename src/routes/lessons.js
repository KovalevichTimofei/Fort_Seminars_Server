import {
  createOne, deleteOne, getByMonth, getAllForCurrentSeminar, getAll, getOne, updateOne,
} from '../models/Lessons';
import {
  getOne as getSeminarById,
} from '../models/Seminars';

const jwt = require('jsonwebtoken');
const Router = require('koa-router');

export const router = new Router({ prefix: '/lessons' });

async function authorize(ctx, next) {
  if (!/\/lessons\/month\/\d/.test(ctx.request.URL.pathname)) {
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
    let lessons;

    try {
      lessons = await getAll();
    } catch (err) {
      ctx.throw(404, 'No information!');
    }

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

    try {
      await Promise.all(promises);
      ctx.body = lessonsList;
    } catch (err) {
      ctx.throw(404, 'No information!');
    }

    next();
  })
  .get('/:id', async (ctx, next) => {
    try {
      const result = await getOne(ctx.params.id);
      const date = { result };
      ctx.body = {
        ...result,
        date: `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`,
      };
    } catch (err) {
      ctx.throw(404, 'Unable find lesson!');
    }

    next();
  })
  .get('/month/:number', async (ctx, next) => {
    try {
      const result = await getByMonth(ctx.params.number);
      ctx.body = result.length ? result : [{ info: 'В этом месяце нет семинаров' }];
    } catch (err) {
      ctx.throw(404, 'Unable find lessons!');
    }

    next();
  })
  .get('/seminar/:seminarId', async (ctx, next) => {
    try {
      ctx.body = await getAllForCurrentSeminar(ctx.params.seminarId);
    } catch (err) {
      ctx.throw(404, 'Unable find lesson!');
    }

    next();
  })
  .post('/create', async (ctx, next) => {
    try {
      const result = await createOne(ctx.request.body);
      const seminar = await getSeminarById(result.seminar_id);
      result.seminar = seminar.title;
      ctx.body = result;
    } catch (err) {
      ctx.throw(500, 'Unable create lesson!');
    }

    next();
  })
  .put('/:id', async (ctx, next) => {
    let lesson;

    try {
      lesson = await updateOne(ctx.params.id, ctx.request.body);

      try {
        const seminar = await getSeminarById(lesson.seminar_id);
        lesson.seminar = seminar.title;
        ctx.body = lesson;
      } catch (err) {
        ctx.throw(500, 'Unable to send updated lesson!');
      }
    } catch (err) {
      if (err.message !== '') {
        ctx.throw(500, 'Unable update lesson!');
      } else {
        ctx.throw(500, err.message);
      }

    }

    next();
  })
  .delete('/:id', async (ctx, next) => {
    try {
      await deleteOne(ctx.params.id);
      ctx.body = { id: ctx.params.id };
    } catch (err) {
      ctx.throw(500, 'Unable delete lesson!');
    }

    next();
  });
