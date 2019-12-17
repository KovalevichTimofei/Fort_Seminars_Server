import Router from 'koa-router';
import successfullyConfirm from '../views/successfullyConfirm';
import unsuccessfullyConfirm from '../views/unsuccessfullyConfirm';

import { createOne, getByEmail } from '../models/Listeners';
import { checkIfExists, createOne as createOneSeminarListener } from '../models/Seminars_Listeners';
import { getAllForCurrentSeminar, getByMonth, getFirstFutureLesson } from '../models/Lessons';
import { getAll, getOne as getOneSeminar } from '../models/Seminars';
import { getOne as getOnePreacher } from '../models/Preachers';

export const router = new Router();

function getQueryParams(queryStr) {
  const pares = queryStr.split('&');
  const result = {};
  pares.forEach((el) => {
    const [key, value] = el.split('=');
    result[key] = decodeURIComponent(value);
  });
  return result;
}

function getLast(arr) {
  return arr[arr.length - 1];
}

function getPrettyDate(date) {
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
}

router
  .get('/preachers/:id', async (ctx) => {
    try {
      ctx.body = await getOnePreacher(ctx.params.id);
    } catch (err) {
      ctx.throw(404, 'Cannot find preacher!');
    }
  })
  .get('/lessons/month/:number', async (ctx) => {
    try {
      const result = await getByMonth(ctx.params.number);
      ctx.body = result.length ? result : [{ info: 'В этом месяце нет семинаров' }];
    } catch (err) {
      ctx.throw(404, 'Unable find lessons!');
    }
  })
  .get('/seminars/current', async (ctx) => {
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
      currentSeminar = await getOneSeminar(seminarId);
      ctx.body = { ...currentSeminar.dataValues, period: seminarPeriod };
    } catch (err) {
      ctx.throw(404, 'Unable to get current seminar!');
    }
  })
  .get('/listeners/register/confirm', async (ctx) => {
    const params = getQueryParams(ctx.req._parsedUrl.query);
    const {
      name, surname, email, seminar,
    } = params;

    try {
      if ((await getByEmail(email)).length === 0) {
        await createOne({ ifo: `${name} ${surname}`, email, id: email });
      }
      if (!(await checkIfExists(seminar, email))) {
        await createOneSeminarListener({ seminar_id: seminar, listener_id: email });
      }
      ctx.body = successfullyConfirm;
    } catch (err) {
      ctx.body = unsuccessfullyConfirm;
    }
  })
  .post('/listeners/register', async (ctx) => {
    const {
      email, seminar, name, surname,
    } = ctx.request.body;

    try {
      let newId;
      const lessons = (await getByEmail(email));

      if (lessons.length === 0) {
        const newLesson = await createOne({ ifo: `${name} ${surname}`, email, id: email });
        newId = newLesson.id;
      } else {
        newId = lessons[0].id;
      }
      if (!(await checkIfExists(seminar.id, newId))) {
        await createOneSeminarListener({ seminar_id: seminar.id, listener_id: newId });
        ctx.body = { result: 'success' };
      } else {
        ctx.throw(400, { result: 'email exists' });
      }
    } catch (err) {
      if (err.status !== 400) {
        ctx.throw(500, 'Unable to register!');
      } else {
        ctx.throw(400, 'email exists');
      }
    }
  });
