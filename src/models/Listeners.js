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

export function getAll(options) {
  const { filterBy, sortBy } = options;

  if (filterBy) {
    return allModels.Seminars_Listeners.findAll({
      include: [{
        model: Listeners,
      }],
      where: {
        [filterBy.field]: filterBy.value,
      },
    })
      .then(data => data.map(item => item.listeners[0]))
      .catch(() => 'fail');
  }
  return Listeners.findAll()
    .then(listeners => listeners)
    .catch(() => 'fail');
}

export function getOne(id) {
  return Listeners.findAll({ where: { id } })
    .then(listeners => (listeners.length ? listeners[0] : Promise.reject()))
    .catch(() => 'fail');
}

export function getByEmail(email) {
  return Listeners.findAll({ where: { email } })
    .then(listeners => listeners)
    .catch(() => 'fail');
}

export function createOne(newItem) {
  const id = newItem.id || generateId();
  return Listeners.create({
    ...newItem,
    id,
  })
    .then(() => ({
      ...newItem,
      id,
    }))
    .catch(() => 'fail');
}

export function updateOne(id, editedInfo) {
  return Listeners.update(editedInfo, { where: { id } })
    .then(() => editedInfo)
    .catch(() => 'fail');
}

export function deleteOne(id) {
  return Listeners.destroy({ where: { id } })
    .then(() => 'success')
    .catch(() => 'fail');
}
