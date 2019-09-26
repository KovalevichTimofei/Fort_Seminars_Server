import nodemailer from 'nodemailer';
import {
  createOne, deleteOne, getAll, getOne, updateOne, getByEmail,
} from '../models/Listeners';
import { checkIfExists, createOne as createOneSeminarListener } from '../models/Seminars_Listeners';
import successfullyConfirm from '../views/successfullyConfirm';
import unsuccessfullyConfirm from '../views/unsuccessfullyConfirm';
import confirmMessage from '../views/confirmMessage';

const Router = require('koa-router');

export const router = new Router({ prefix: '/listeners' });

router
  .get('/', async (ctx, next) => {
    ctx.body = await getAll();
    next();
  })
  .get('/:id', async (ctx, next) => {
    ctx.body = await getOne(ctx.params.id);
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
    ctx.body = await createOne(ctx.request.body);
    next();
  })
  .post('/register', async (ctx, next) => {
    console.log(ctx.request.body);
    const { email } = ctx.request.body;
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
    transport.sendMail(message, (err, info) => {
      if (err) {
        console.log(err);
        ctx.body = { result: 'error' };
      } else {
        ctx.body = { result: 'success' };
      }
    });
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

function getQueryParams(queryStr) {
  const pares = queryStr.split('&');
  const result = {};
  pares.forEach((el) => {
    const [key, value] = el.split('=');
    result[key] = decodeURIComponent(value);
  });
  return result;
}
