import Router from 'koa-router';
import { authorize, getUndefinedFields, isEmpty } from '../plugins';

import {
  createOne, deleteOne, getAllForCurrentSeminar, getAll, getOne, updateOne,
} from '../models/Lessons';
import {
  getOne as getSeminarById,
} from '../models/Seminars';

export const router = new Router({ prefix: '/lessons' });

router.use(authorize);

router
  .get('/', async (ctx) => {
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
  })
  .get('/:id', async (ctx) => {
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
  })
  .get('/seminar/:seminarId', async (ctx) => {
    try {
      ctx.body = await getAllForCurrentSeminar(ctx.params.seminarId);
    } catch (err) {
      ctx.throw(404, 'Unable find lesson!');
    }
  })
  .post('/create', async (ctx) => {
    const emptyFields = getUndefinedFields(ctx.request.body, ['date', 'part_numb']);

    if (emptyFields) {
      ctx.throw(400, `This fields are missed: ${emptyFields}`);
    }

    try {
      const result = await createOne(ctx.request.body);
      const seminar = await getSeminarById(result.seminar_id);
      result.seminar = seminar.title;
      ctx.body = result;
    } catch (err) {
      ctx.throw(500, 'Unable create lesson!');
    }
  })
  .put('/:id', async (ctx) => {
    if (isEmpty(ctx.request.body)) {
      ctx.throw(400, 'Empty body');
    }

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
  })
  .delete('/:id', async (ctx) => {
    try {
      await deleteOne(ctx.params.id);
      ctx.body = { id: ctx.params.id };
    } catch (err) {
      ctx.throw(500, 'Unable delete lesson!');
    }
  });
