const Sequelize = require('sequelize');

const { Op } = Sequelize;

const fakeSeminars = [
  {
    title: 'Душепопечение, как это работает',
    preacher_id: '1',
    invite_link: 'https://www.youtube.com/embed/z14zsBbfLec',
  },
  {
    title: 'Духовная брань',
    preacher_id: '1',
    invite_link: 'https://www.youtube.com/embed/miikxanKXcE',
  },
];

class Seminars extends Sequelize.Model { }

export function initSeminars(sequelize, models) {
  const { Preachers } = models;

  Seminars.init({
    id: {
      type: Sequelize.STRING,
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
      type: Sequelize.STRING,

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
      id: `${i + 1}`,
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

export function getAll(options = {}) {
  const { filterBy, sortBy } = options;
  if (filterBy) {
    return Seminars.findAll({
      where: {
        [filterBy.field]: {
          [Op.substring]: filterBy.value,
        },
      },
    })
      .then(seminars => seminars)
      .catch(() => 'fail');
  }
  return Seminars.findAll()
    .then(seminars => seminars)
    .catch(() => 'fail');
}

export function getOne(id) {
  return Seminars.findAll({ where: { id } })
    .then(seminars => (seminars.length ? seminars[0] : Promise.reject()))
    .catch(() => 'fail');
}

export function updateOne(id, editedInfo) {
  return Seminars.update(editedInfo, { where: { id } })
    .then(() => editedInfo)
    .catch(() => 'fail');
}

export function createOne(newItem) {
  return Seminars.create(newItem)
    .then(() => newItem)
    .catch(() => 'fail');
}

export function deleteOne(id) {
  return Seminars.destroy({ where: { id } })
    .then(() => 'success')
    .catch(() => 'fail');
}
