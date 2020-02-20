import Router from 'koa-router';
import { authorize, getUndefinedFields, isEmpty } from '../plugins';
import {
  getAll, getOne, createOne, updateOne, deleteOne,
} from '../models/Seminars';
import {
  getAllForCurrentSeminar,
  createOne as createOneLesson,
  updateOne as updateOneLesson,
  getOne as getLessonById,
  deleteBySeminarId,
} from '../models/Lessons';
import { getOne as getPreacherById, createOne as createOnePreacher } from '../models/Preachers';

export const router = new Router({ prefix: '/seminars' });

router.use(authorize);

router
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
    const emptyFields = getUndefinedFields(ctx.request.body, ['seminar', 'preacher', 'lessons']);

    if (emptyFields) {
      ctx.throw(400, `This fields are missed: ${emptyFields}`);
    }

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
    if (isEmpty(ctx.request.body)) {
      ctx.throw(400, 'Empty body');
    }

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
