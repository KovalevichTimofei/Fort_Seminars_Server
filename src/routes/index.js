import Router from 'koa-router';

import { router as defaultRouter } from './default';
import { router as seminarsRouter } from './seminars';
import { router as lessonsRouter } from './lessons';
import { router as listenersRouter } from './listeners';
import { router as preachersRouter } from './preachers';
import { router as authRouter } from './authorization';

const router = new Router();

router.use(
  defaultRouter.routes(),
  defaultRouter.allowedMethods(),
  authRouter.routes(),
  authRouter.allowedMethods(),
  seminarsRouter.routes(),
  seminarsRouter.allowedMethods(),
  lessonsRouter.routes(),
  lessonsRouter.allowedMethods(),
  listenersRouter.routes(),
  listenersRouter.allowedMethods(),
  preachersRouter.routes(),
  preachersRouter.allowedMethods(),
);

export default function connectRoutes(app) {
  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      ctx.status = err.statusCode || err.status || 500;
      ctx.body = { code: err.statusCode, message: err.message };
      ctx.app.emit('error', err, ctx);
    }
  });
  app.use(router.routes());
}
