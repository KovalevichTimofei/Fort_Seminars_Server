import { generateId } from '../plugins';

const Sequelize = require('sequelize');

class Preachers extends Sequelize.Model {}

export function initPreachers(sequelize) {
  Preachers.init({
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
    photo_url: {
      type: Sequelize.STRING,
    },
    info: {
      type: Sequelize.TEXT,
    },
  }, {
    sequelize,
    modelName: 'preachers',
  });

  return Preachers;
}
async function recreateAndFillTable() {
  await Preachers.sync({ force: true }).then(() => Preachers.create({
    id: '1',
    ifo: 'Алексей Коломийцев',
    photo_url: 'https://bogvideo.com/wp-content/uploads/2018/01/Alexey-Kolomiytsev.jpg',
    info: 'Пастор-учитель библейской церкви "Слово благодати", Батл Граунд, Вашингтон, США',
  }));
}

export async function generatePreachers(sequelize) {
  initPreachers(sequelize);
  await recreateAndFillTable();

  return Preachers;
}

export async function getAll() {
  return Preachers.findAll()
    .then(preachers => preachers)
    .catch(() => 'fail');
}

export async function getOne(id) {
  return Preachers.findAll({ where: { id } })
    .then(preachers => preachers[0])
    .catch(() => 'fail');
}

export async function createOne(newItem) {
  const id = generateId();
  return Preachers.create({
    ...newItem,
    id,
  })
    .then(() => ({
      ...newItem,
      id,
    }))
    .catch(() => 'fail');
}

export async function updateOne(id, editedInfo) {
  return Preachers.update(editedInfo, { where: { id } })
    .then(() => editedInfo)
    .catch(() => 'fail');
}

export async function deleteOne(id) {
  return Preachers.destroy({ where: { id } })
    .then(() => 'success')
    .catch((err) => {
      if (err.name === 'SequelizeForeignKeyConstraintError') {
        return 'connected to seminar';
      } else {
        return 'fail';
      }
    });
}
