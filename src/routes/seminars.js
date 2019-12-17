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

const jwt = require('jsonwebtoken');
const Router = require('koa-router');

export const router = new Router({ prefix: '/seminars' });

async function authorize(ctx, next) {
  if (ctx.request.URL.pathname !== '/seminars/current') {
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

function getPrettyDate(date) {
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
}

router
  .get('/current', async (ctx) => {
    let lesson;
    let seminarId;
    let seminarLessons;
    let currentSeminar;

    try {
      lesson = await getFirstFutureLesson();
      seminarId = lesson ? lesson.seminar_id : getLast(await getAll()).id;
    } catch (err) {
      ctx.throw(404, 'Unable to get 1st future lesson!');
    }

    try {
      seminarLessons = (await getAllForCurrentSeminar(seminarId));
    } catch (err) {
      ctx.throw(404, 'Unable to get lessons for seminar!');
    }

    const seminarPeriod = `${getPrettyDate(seminarLessons[0].date)} - ${getPrettyDate(seminarLessons[seminarLessons.length - 1].date)}`;

    try {
      currentSeminar = await getOne(seminarId);
      ctx.body = { ...currentSeminar.dataValues, period: seminarPeriod };
    } catch (err) {
      ctx.throw(404, 'Unable to get current seminar!');
    }
  })
  .get('/:id', async (ctx) => {
    try {
      ctx.body = await getOne(ctx.params.id);
    } catch (err) {
      ctx.throw(500, 'Cannot delete listener!');
    }
  })
  .post('/',
    async (ctx) => {
      let seminarsList;

      try {
        seminarsList = await getAll(ctx.request.body);
      } catch (err) {
        ctx.throw(404, 'No information!');
      }

      const promises = seminarsList.map(async seminar => ({
        id: seminar.id,
        title: seminar.title,
        invite_link: seminar.invite_link,
        lessons: (await getAllForCurrentSeminar(seminar.id)).map(lesson => lesson.info),
        preacher: (await getPreacherById(seminar.preacher_id)).ifo,
      }));

      try {
        ctx.body = await Promise.all(promises);
      } catch (err) {
        ctx.throw(404, 'No information!');
      }
    })
  .post('/create', async (ctx) => {
    let preacher;

    if (ctx.request.body.preacher.id) {
      try {
        preacher = await getPreacherById(ctx.request.body.preacher.id);
      } catch (err) {
        ctx.throw(404, 'Unable to find preacher for seminar being created!');
      }
    } else {
      try {
        preacher = await createOnePreacher(ctx.request.body.preacher);
      } catch (err) {
        ctx.throw(500, 'Unable to create preacher for seminar being created!');
      }
    }

    let seminar;

    try {
      seminar = await createOne({
        ...ctx.request.body.seminar,
        preacher_id: preacher.id,
      });
    } catch (err) {
      ctx.throw(500, 'Unable to create seminar!');
    }

    const lessons = [];

    const promises = ctx.request.body.lessons.map(async (el, i) => {
      const newLesson = await createOneLesson({
        ...el,
        part_numb: i + 1,
      });
      lessons.push(newLesson);
    });

    try {
      await Promise.all(promises);
      ctx.body = {
        id: seminar.id,
        invite_link: seminar.invite_link,
        preacher: preacher.ifo,
        title: seminar.title,
        lessons: lessons.map(el => el.info),
      };
    } catch (err) {
      ctx.throw(500, 'Unable to create lessons for seminar!');
    }
  })
  .put('/:id', async (ctx) => {
    let preacher;

    if (ctx.request.body.preacher.id) {
      try {
        preacher = await getPreacherById(ctx.request.body.preacher.id);
      } catch (err) {
        ctx.throw(404, 'Unable to find preacher for edited seminar!');
      }
    } else {
      try {
        preacher = await createOnePreacher(ctx.request.body.preacher);
      } catch (err) {
        ctx.throw(500, 'Unable to create preacher for edited seminar!');
      }
    }

    let seminar;

    try {
      seminar = await updateOne(ctx.params.id, {
        ...ctx.request.body.seminar,
        preacher_id: preacher.id,
      });
    } catch (err) {
      ctx.throw(500, 'Unable to update seminar!');
    }

    const lessons = [];

    const promises = ctx.request.body.lessons.map(async (el, i) => {
      if (await getLessonById(el.id)) {
        const editedLesson = await updateOneLesson(el.id, {
          ...el,
          part_numb: i + 1,
        });
        lessons.push(editedLesson);
      } else {
        const newLesson = await createOneLesson({
          ...el,
          part_numb: i + 1,
        });
        lessons.push(newLesson);
      }
    });

    try {
      await Promise.all(promises);
      ctx.body = {
        id: seminar.id,
        invite_link: seminar.invite_link,
        preacher: preacher.ifo,
        title: seminar.title,
        lessons: lessons.map(el => el.info),
      };
    } catch (err) {
      ctx.throw(500, 'Unable to update seminar!');
    }
  })
  .delete('/:id', async (ctx) => {
    try {
      await deleteBySeminarId(ctx.params.id);
    } catch (err) {
      ctx.throw(500, 'Unable to delete seminars lessons!');
    }

    try {
      await deleteOne(ctx.params.id);
    } catch (err) {
      ctx.throw(500, 'Unable to delete seminar!');
    }

    ctx.body = { id: ctx.params.id };
  });

function getLast(arr) {
  return arr[arr.length - 1];
}
