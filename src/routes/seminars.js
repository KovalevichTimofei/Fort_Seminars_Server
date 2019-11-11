import {
  getAll, getOne, createOne, updateOne, deleteOne,
} from '../models/Seminars';
import {
  getFirstFutureLesson, getAllForCurrentSeminar, createOne as createOneLesson, deleteBySeminarId,
} from '../models/Lessons';
import { getOne as getPreacherById, createOne as createOnePreacher } from '../models/Preachers';

const Router = require('koa-router');

export const router = new Router({ prefix: '/seminars' });

function getPrettyDate(date) {
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
}

router
  .post('/', async (ctx, next) => {
    const seminarsList = await getAll(ctx.request.body);
    const promises = seminarsList.map(async seminar => ({
      id: seminar.id,
      title: seminar.title,
      invite_link: seminar.invite_link,
      lessons: (await getAllForCurrentSeminar(seminar.id)).map(lesson => lesson.info),
      preacher: (await getPreacherById(seminar.preacher_id)).ifo,
    }));

    ctx.body = await Promise.all(promises);

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
    const preacher = ctx.request.body.preacher.id
      ? await getPreacherById(ctx.request.body.preacher.id)
      : await createOnePreacher(ctx.request.body.preacher);
    const seminar = await createOne({
      ...ctx.request.body.seminar,
      preacher_id: preacher.id,
    });
    const lessons = [];

    const promises = ctx.request.body.lessons.map(async (el, i) => {
      const newLesson = await createOneLesson({
        ...el,
        part_numb: i + 1,
      });
      lessons.push(newLesson);
    });

    await Promise.all(promises);

    ctx.body = {
      id: seminar.id,
      invite_link: seminar.invite_link,
      preacher: preacher.ifo,
      title: seminar.title,
      lessons: lessons.map(el => el.info),
    };

    next();
  })
  .put('/:id', async (ctx, next) => {
    ctx.body = await updateOne(ctx.params.id, ctx.request.body);
    next();
  })
  .delete('/:id', async (ctx, next) => {
    const lessonsDeleteResult = await deleteBySeminarId(ctx.params.id);
    if (lessonsDeleteResult !== 'success') throw new Error('Unable to delete lessons by seminar id');
    ctx.body = await deleteOne(ctx.params.id);
    ctx.body = { id: ctx.params.id };
    next();
  });
