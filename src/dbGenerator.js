import './env';
import { generatePreachers } from './models/Preachers';
import { generateSeminars } from './models/Seminars';
import { generateLessons } from './models/Lessons';
import { generateListeners } from './models/Listeners';
import { generateSeminarsListeners } from './models/Seminars_Listeners';

const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.DB_URL);// 'postgres://postgres:root@localhost:5432/seminars');

sequelize
  .authenticate()
  .then(async () => {
    const Preachers = await generatePreachers(sequelize);
    const Seminars = await generateSeminars(sequelize, { Preachers });
    await generateLessons(sequelize, { Seminars });
    const Listeners = await generateListeners(sequelize);
    await generateSeminarsListeners(sequelize, { Listeners, Seminars });
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });
