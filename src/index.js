import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import './env';
import connectRoutes from './routes';
import { initDb } from './models';

async function main() {
  console.log('main');
  const app = new Koa();
  console.log('const app = new Koa();');
  app.use(bodyParser());
  console.log('app.use(bodyParser());');
  app.use(cors());
  console.log('app.use(cors());');
  await initDb();
  console.log('await initDb();');

  app.use(async (ctx, next) => {
    await next();
    if (!ctx.body && ctx.status === 404) {
      ctx.throw(404, { error: 'Nonexistent route!' });
    }
  });
  console.log('use routes');
  connectRoutes(app);
  console.log('connectRoutes(app);');
  const port = process.env.PORT || 3000;
  console.log('set port');
  app.listen(port);
  console.log(port);
}

main();
