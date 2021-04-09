import { initPreachers } from './Preachers';
import { initSeminars } from './Seminars';
import { initLessons } from './Lessons';
import { initListeners } from './Listeners';
import { initSeminarsListeners } from './Seminars_Listeners';

const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.DB_URL);

export const models = {};

export async function initDb() {
  try {
    await sequelize.authenticate();

    models.Preachers = initPreachers(sequelize);
    models.Seminars = initSeminars(sequelize, { Preachers: models.Preachers });
    models.Lessons = initLessons(sequelize, { Preachers: models.Preachers });
    models.Listeners = initListeners(sequelize, models);
    models.Seminars_Listeners = initSeminarsListeners(
      sequelize,
      { Listeners: models.Listeners, Seminars: models.Seminars }
    );
    console.log('Connection has been established successfully.');
  } catch (err) {
    console.error('Unable to connect to the database:', err);
  }
}
