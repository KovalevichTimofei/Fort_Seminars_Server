const Sequelize = require('sequelize');

const { Op } = Sequelize;

const fakeSeminars = [
  {
    title: 'Душепопечение, как это работает',
    preacher_id: 1,
    invite_link: 'https://www.youtube.com/embed/z14zsBbfLec',
  },
  {
    title: 'Духовная брань',
    preacher_id: 1,
    invite_link: 'https://www.youtube.com/embed/miikxanKXcE',
  },
];

class Seminars extends Sequelize.Model { }

export function initSeminars(sequelize, models) {
  const { Preachers } = models;

  Seminars.init({
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: true,
      primaryKey: true,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    invite_link: {
      type: Sequelize.STRING,
    },
    preacher_id: {
      type: Sequelize.INTEGER,

      references: {
        model: Preachers,
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
      },
    },
  }, {
    sequelize,
    modelName: 'seminars',
  });

  return Seminars;
}

async function recreateAndFillTable() {
  await Seminars.sync({ force: true }).then(() => {
    fakeSeminars.forEach((el, i) => Seminars.create({
      id: i + 1,
      title: el.title,
      preacher_id: el.preacher_id,
      invite_link: el.invite_link,
    }));
  });
}

export async function generateSeminars(sequelize, models) {
  initSeminars(sequelize, models);
  await recreateAndFillTable();

  return Seminars;
}

export async function getAll(options) {
  const { filterBy, sortBy } = options;
  if (filterBy) {
    return await Seminars.findAll({
      where: {
        [filterBy.field]: {
          [Op.substring]: filterBy.value,
        },
      },
    }).then(seminars => seminars);
  }
  return await Seminars.findAll().then(seminars => seminars);
}

export async function getOne(id) {
  return await Seminars.findAll({ where: { id } }).then(seminars => seminars[0]);
}

export async function updateOne(id, editedInfo) {
  return await Seminars.update(editedInfo, { where: { id } }).then(seminar => seminar);
}

export async function createOne(newItem) {
  return await Seminars.create(newItem).then(seminar => seminar);
}

export async function deleteOne(id) {
  return await Seminars.destroy({ where: { id } }).then(() => 'success');
}
