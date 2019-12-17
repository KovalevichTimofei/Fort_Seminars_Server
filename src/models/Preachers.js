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
  try {
    return await Preachers.findAll();
  } catch (err) {
    throw new Error(err);
  }
}

export async function getOne(id) {
  try {
    const preachers = await Preachers.findAll({ where: { id } });
    return preachers.length ? preachers[0] : new Error('There is no preachers with current id!');
  } catch (err) {
    throw new Error(err);
  }
}

export async function createOne(newItem) {
  const id = generateId();

  try {
    await Preachers.create({
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
    await Preachers.update(editedInfo, { where: { id } });
    return editedInfo;
  } catch (err) {
    throw new Error(err);
  }
}

export async function deleteOne(id) {
  try {
    await Preachers.destroy({ where: { id } });
    return 'success';
  } catch (err) {
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      throw new Error('connected to seminar');
    }
    throw new Error(err);
  }
}
