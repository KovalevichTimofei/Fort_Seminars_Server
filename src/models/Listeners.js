import { generateId } from '../plugins';

const Sequelize = require('sequelize');

let allModels = {};

class Listeners extends Sequelize.Model {}

const fakeListeners = [
  {
    ifo: 'Kovalevich Timofei Andreevich',
    email: 'kovta.98@mail.ru',
  },
  {
    ifo: 'Carbon',
    email: 'carbon.99@mail.ru',
  },
  {
    ifo: 'Monsieur de la Sergua',
    email: 'sergua.2000@mail.ru',
  },
  {
    ifo: 'Pan Eugeniusz',
    email: 'yaugen.97@mail.ru',
  },
];

export function initListeners(sequelize, models) {
  allModels = models;
  Listeners.init({
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      primaryKey: true,
    },
    ifo: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'listeners',
  });

  return Listeners;
}
async function recreateAndFillTable() {
  await Listeners.sync({ force: true }).then(() => {
    fakeListeners.forEach((el, i) => Listeners.create({
      id: i + 1,
      ifo: el.ifo,
      email: el.email,
    }));
  });
}

export async function generateListeners(sequelize) {
  initListeners(sequelize);
  await recreateAndFillTable();

  return Listeners;
}

export async function getAll(options) {
  const { filterBy, sortBy } = options;

  try {
    if (filterBy) {
      const data = await allModels.Seminars_Listeners.findAll({
        include: [{
          model: Listeners,
        }],
        where: {
          [filterBy.field]: filterBy.value,
        },
      });

      return data.map(item => item.listeners[0]);
    }

    return await Listeners.findAll();
  } catch (err) {
    throw new Error(err);
  }
}

export async function getOne(id) {
  try {
    const listeners = await Listeners.findAll({ where: { id } });
    return listeners.length ? listeners[0] : Promise.reject();
  } catch (err) {
    throw new Error(err);
  }
}

export async function getByEmail(email) {
  try {
    return await Listeners.findAll({ where: { email } });
  } catch (err) {
    throw new Error(err);
  }
}

export async function createOne(newItem) {
  const id = newItem.id || generateId();

  try {
    await Listeners.create({
      ...newItem,
      id,
    });

    return {
      ...newItem,
      id,
    };
  } catch (err) {
    throw new Error(err);
  }
}

export async function updateOne(id, editedInfo) {
  try {
    await Listeners.update(editedInfo, { where: { id } });
    return editedInfo;
  } catch (err) {
    throw new Error(err);
  }
}

export async function deleteOne(id) {
  try {
    await Listeners.destroy({ where: { id } });
    return 'success';
  } catch (err) {
    throw new Error(err);
  }
}
