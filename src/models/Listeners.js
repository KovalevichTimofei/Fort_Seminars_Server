import {generateId} from "../plugins";

const Sequelize = require('sequelize');

let allModels = {};

let sequelize1 = {};
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
  sequelize1 = sequelize;
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
  if (filterBy) {
    return allModels.Seminars_Listeners.findAll({
      include: [{
        model: Listeners,
      }],
      where: {
        [filterBy.field]: filterBy.value,
      },
    }).map(item => item.listeners[0]);
  }
  return Listeners.findAll().then(listeners => listeners);
}

export async function getOne(id) {
  return Listeners.findAll({ where: { id } }).then(listeners => listeners[0]);
}

export async function getByEmail(email) {
  return Listeners.findAll({ where: { email } }).then(listener => listener);
}

export async function updateOne(id, editedInfo) {
  await Listeners.update(editedInfo, { where: { id } });
  return getOne(id);
}

export async function createOne(newItem) {
  return Listeners.create({
    ...newItem,
    id: generateId(),
  }).then(listener => listener);
}

export async function deleteOne(id) {
  return Listeners.destroy({ where: { id } }).then(() => 'success');
}
