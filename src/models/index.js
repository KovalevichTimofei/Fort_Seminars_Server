import { initPreachers } from './Preachers';
import { initSeminars } from './Seminars';
import { initLessons } from './Lessons';
import { initListeners } from './Listeners';
import { initSeminarsListeners } from './Seminars_Listeners';

const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.DB_URL);

export const models = {};

export async function initDb() {
  sequelize
    .authenticate()
    .then(() => {
      models.preachers = initPreachers(sequelize);
      models.seminars = initSeminars(sequelize, { preachers: models.preachers });
      initLessons(sequelize, { preachers: models.preachers });
      models.listeners = initListeners(sequelize);
      initSeminarsListeners(sequelize, { preachers: models.preachers, seminars: models.seminars });
      console.log('Connection has been established successfully.');
    })
    .catch((err) => {
      console.error('Unable to connect to the database:', err);
    });
}
