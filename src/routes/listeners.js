// import nodemailer from 'nodemailer';
import {
  createOne, deleteOne, getAll, getOne, updateOne, getByEmail,
} from '../models/Listeners';
import { checkIfExists, createOne as createOneSeminarListener } from '../models/Seminars_Listeners';
import successfullyConfirm from '../views/successfullyConfirm';
import unsuccessfullyConfirm from '../views/unsuccessfullyConfirm';
// import confirmMessage from '../views/confirmMessage';

const jwt = require('jsonwebtoken');
const Router = require('koa-router');

export const router = new Router({ prefix: '/listeners' });

async function authorize(ctx, next) {
  if (ctx.request.URL.pathname !== '/listeners/register') {
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
  .post('/', async (ctx, next) => {
    const result = await getAll(ctx.request.body);

    if (result === 'fail') {
      ctx.throw(404, 'No information!');
    } else {
      ctx.body = result;
    }

    next();
  })
  .get('/:id', async (ctx, next) => {
    const result = await getOne(ctx.params.id);

    if (result === 'fail') {
      ctx.throw(404, 'Cannot find listener!');
    } else {
      ctx.body = result;
    }

    next();
  })
  .get('/register/confirm', async (ctx, next) => {
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

    next();
  })
  .post('/create', async (ctx, next) => {
    const result = await createOne(ctx.request.body);

    if (result === 'fail') {
      ctx.throw(500, 'Cannot create listener!');
    } else {
      ctx.body = result;
    }

    next();
  })
  /* .post('/register', async (ctx, next) => {
    console.log(ctx.request.body);
    const { email, seminar } = ctx.request.body;
    let info;
    let result = {};
    const transport = nodemailer.createTransport({
      service: 'mail.ru',
      auth: {
        user: 'Mfortechnaya@mail.ru',
        pass: 'molod_brest2015',
      },
    });
    const message = {
      from: 'Mfortechnaya@mail.ru',
      to: email,
      subject: 'Регистрация на семинар',
      html: confirmMessage(ctx.request.body),
    };

    const ifExist = await checkIfExists(seminar.id, email);

    console.log('ifExist ' + ifExist);
    if (ifExist) {
      result = { result: 'email exists' };
    } else {
      info = await transport.sendMail(message);
      console.log(info);
      result = { result: info ? 'success' : 'error' };
    }

    ctx.body = result;
    next();
  }) */
  .post('/register', async (ctx, next) => {
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

    next();
  })
  .put('/:id', async (ctx, next) => {
    const result = await updateOne(ctx.params.id, ctx.request.body);

    if (result === 'fail') {
      ctx.throw(500, 'Cannot update listener!');
    } else {
      ctx.body = result;
    }

    next();
  })
  .delete('/:id', async (ctx, next) => {
    const result = await deleteOne(ctx.params.id);

    if (result === 'fail') {
      ctx.throw(500, 'Cannot delete listener!');
    } else {
      ctx.body = { id: ctx.params.id };
    }

    next();
  });

function getQueryParams(queryStr) {
  const pares = queryStr.split('&');
  const result = {};
  pares.forEach((el) => {
    const [key, value] = el.split('=');
    result[key] = decodeURIComponent(value);
  });
  return result;
}
