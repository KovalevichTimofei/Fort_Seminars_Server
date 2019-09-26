import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from 'koa-cors';
import connectRoutes from './routes';
import './env';
import { initDb } from './models';

async function main() {
  const app = new Koa();

  app.use(bodyParser());
  app.use(cors());

  await initDb();

  connectRoutes(app);

  if (require.main === module) {
    app.listen(3000);
  }
}

main();
