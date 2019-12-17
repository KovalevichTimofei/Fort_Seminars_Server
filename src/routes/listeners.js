import {
  createOne, deleteOne, getAll, getOne, updateOne, getByEmail,
} from '../models/Listeners';
import { checkIfExists, createOne as createOneSeminarListener } from '../models/Seminars_Listeners';
import successfullyConfirm from '../views/successfullyConfirm';
import unsuccessfullyConfirm from '../views/unsuccessfullyConfirm';

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
    try {
      ctx.body = await getAll(ctx.request.body);
    } catch (err) {
      ctx.throw(404, 'No information!');
    }

    next();
  })
  .get('/:id', async (ctx, next) => {
    try {
      ctx.body = await getOne(ctx.params.id);
    } catch (err) {
      ctx.throw(404, 'Cannot find listener!');
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
    try {
      ctx.body = await createOne(ctx.request.body);
    } catch (err) {
      ctx.throw(500, 'Cannot create listener!');
    }

    next();
  })
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
    try {
      ctx.body = await updateOne(ctx.params.id, ctx.request.body);
    } catch (err) {
      ctx.throw(500, 'Cannot update listener!');
    }

    next();
  })
  .delete('/:id', async (ctx, next) => {
    try {
      await deleteOne(ctx.params.id);
      ctx.body = { id: ctx.params.id };
    } catch (err) {
      ctx.throw(500, 'Cannot delete listener!');
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
