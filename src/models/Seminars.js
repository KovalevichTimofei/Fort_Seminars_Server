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

export async function getAll(options = {}) {
  const { filterBy, sortBy } = options;

  try {
    if (filterBy) {
      return await Seminars.findAll({
        where: {
          [filterBy.field]: {
            [Op.substring]: filterBy.value,
          },
        },
      });
    }
    return await Seminars.findAll();
  } catch (err) {
    throw new Error(err);
  }
}

export async function getOne(id) {
  try {
    const seminars = await Seminars.findAll({ where: { id } });
    return seminars.length ? seminars[0] : Promise.reject();
  } catch (err) {
    throw new Error(err);
  }
}

export async function updateOne(id, editedInfo) {
  try {
    await Seminars.update(editedInfo, { where: { id } });
    return editedInfo;
  } catch (err) {
    throw new Error(err);
  }
}

export async function createOne(newItem) {
  try {
    await Seminars.create(newItem);
    return newItem;
  } catch (err) {
    throw new Error(err);
  }
}

export async function deleteOne(id) {
  try {
    await Seminars.destroy({ where: { id } });
    return 'success';
  } catch (err) {
    throw new Error(err);
  }
}
