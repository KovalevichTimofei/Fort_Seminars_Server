import {
  getAll, getOne, createOne, updateOne, deleteOne,
} from '../models/Seminars';
import {
  getFirstFutureLesson,
  getAllForCurrentSeminar,
  createOne as createOneLesson,
  updateOne as updateOneLesson,
  getOne as getLessonById,
  deleteBySeminarId,
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

    if (seminarsList === 'fail') ctx.throw(404, 'No information!');

    const promises = seminarsList.map(async seminar => ({
      id: seminar.id,
      title: seminar.title,
      invite_link: seminar.invite_link,
      lessons: (await getAllForCurrentSeminar(seminar.id)
        .then(result => result === 'fail' ? Promise.rejected() : result)
      ).map(lesson => lesson.info),
      preacher: (await getPreacherById(seminar.preacher_id)
        .then(result => result === 'fail' ? Promise.rejected() : result)
      ).ifo,
    }));

    await Promise.all(promises)
      .then((data) => { ctx.body = data; })
      .catch(() => ctx.throw(404, 'No information!'));

    next();
  })
  .get('/current', async (ctx, next) => {
    const lesson = await getFirstFutureLesson();
    const seminarId = lesson ? lesson.seminar_id : getLast(await getAll()).id;
    if (seminarId === 'fail') ctx.throw(404, 'Unable to get 1st future lesson!');
    const seminarLessons = (await getAllForCurrentSeminar(seminarId));
    if (seminarLessons === 'fail') ctx.throw(404, 'Unable to get lessons for seminar!');
    const seminarPeriod = `${getPrettyDate(seminarLessons[0].date)} - ${getPrettyDate(seminarLessons[seminarLessons.length - 1].date)}`;
    const currentSeminar = await getOne(seminarId);
    if (currentSeminar === 'fail') ctx.throw(404, 'Unable to get current seminar!');
    else ctx.body = { ...currentSeminar.dataValues, period: seminarPeriod };
    next();
  })
  .get('/:id', async (ctx, next) => {
    const result = await getOne(ctx.params.id);

    if (result === 'fail') {
      ctx.throw(500, 'Cannot delete listener!');
    } else {
      ctx.body = result;
    }

    next();
  })
  .post('/create', async (ctx, next) => {
    const preacher = ctx.request.body.preacher.id
      ? await getPreacherById(ctx.request.body.preacher.id)
        .catch(() => ctx.throw(404, 'Unable to find preacher for edited seminar!'))
      : await createOnePreacher(ctx.request.body.preacher)
        .catch(() => ctx.throw(500, 'Unable to create preacher for edited seminar!'));

    const seminar = await createOne({
      ...ctx.request.body.seminar,
      preacher_id: preacher.id,
    });
    if (seminar === 'fail') ctx.throw(500, 'Unable to create seminar!');

    const lessons = [];

    const promises = ctx.request.body.lessons.map(async (el, i) => {
      const newLesson = await createOneLesson({
        ...el,
        part_numb: i + 1,
      }).then(result => result === 'fail' ? Promise.rejected() : result);
      lessons.push(newLesson);
    });

    await Promise.all(promises)
      .then(() => {
        ctx.body = {
          id: seminar.id,
          invite_link: seminar.invite_link,
          preacher: preacher.ifo,
          title: seminar.title,
          lessons: lessons.map(el => el.info),
        };
      })
      .catch(() => ctx.throw(500, 'Unable to create lessons for seminar!'));

    next();
  })
  .put('/:id', async (ctx, next) => {
    const preacher = ctx.request.body.preacher.id
      ? await getPreacherById(ctx.request.body.preacher.id)
        .catch(() => ctx.throw(404, 'Unable to find preacher for edited seminar!'))
      : await createOnePreacher(ctx.request.body.preacher)
        .catch(() => ctx.throw(500, 'Unable to create preacher for edited seminar!'));

    const seminar = await updateOne(ctx.params.id, {
      ...ctx.request.body.seminar,
      preacher_id: preacher.id,
    })
      .catch(() => ctx.throw(500, 'Unable to update seminar!'));
    const lessons = [];

    const promises = ctx.request.body.lessons.map(async (el, i) => {
      if (await getLessonById(el.id).then(result => result === 'fail' ? Promise.rejected() : result)) {
        const editedLesson = await updateOneLesson(el.id, {
          ...el,
          part_numb: i + 1,
        }).then(result => result === 'fail' ? Promise.rejected() : result);
        lessons.push(editedLesson);
      } else {
        const newLesson = await createOneLesson({
          ...el,
          part_numb: i + 1,
        }).then(result => result === 'fail' ? Promise.rejected() : result);
        lessons.push(newLesson);
      }
    });

    await Promise.all(promises)
      .then(() => {
        ctx.body = {
          id: seminar.id,
          invite_link: seminar.invite_link,
          preacher: preacher.ifo,
          title: seminar.title,
          lessons: lessons.map(el => el.info),
        };
      })
      .catch(() => ctx.throw(500, 'Unable to update seminar!'));

    next();
  })
  .delete('/:id', async (ctx, next) => {
    await deleteBySeminarId(ctx.params.id)
      .then(result => result === 'fail' ? ctx.throw(500, 'Unable to delete seminars lessons!') : result);

    await deleteOne(ctx.params.id)
      .then(result => result === 'fail' ? ctx.throw(500, 'Unable to delete seminar!') : result);

    ctx.body = { id: ctx.params.id };
    next();
  });

function getLast(arr) {
  return arr[arr.length - 1];
}
