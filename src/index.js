import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from 'koa-cors';
import './env';
import connectRoutes from './routes';
import { initDb } from './models';

async function main() {
  const app = new Koa();

  app.use(bodyParser());
  app.use(cors());

  await initDb();

  app.use(async (ctx) => {
    await next();
    if (!ctx.body && ctx.status === 404) {
      ctx.throw(404, { error: 'Nonexistent route!' });
    }
  });

  connectRoutes(app);

  if (require.main === module) {
    const port = process.env.PORT || 3000;
    app.listen(port);
    console.log(port);
  }
}

main();
