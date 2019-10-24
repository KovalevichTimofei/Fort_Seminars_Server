const Sequelize = require('sequelize');

const fakePairs = [
  {
    listener_id: 1,
    seminar_id: 1,
  },
  {
    listener_id: 2,
    seminar_id: 1,
  },
  {
    listener_id: 3,
    seminar_id: 1,
  },
  {
    listener_id: 4,
    seminar_id: 1,
  },
  {
    listener_id: 1,
    seminar_id: 2,
  },
  {
    listener_id: 2,
    seminar_id: 2,
  },
  {
    listener_id: 3,
    seminar_id: 2,
  },
  {
    listener_id: 4,
    seminar_id: 2,
  },
];

class SeminarsListeners extends Sequelize.Model {}

export function initSeminarsListeners(sequelize, models) {
  const { Seminars, Listeners } = models;

  SeminarsListeners.init({
    listener_id: {
      type: Sequelize.STRING,

      references: {
        model: Listeners,
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
      },
    },
    seminar_id: {
      type: Sequelize.INTEGER,

      references: {
        model: Seminars,
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
      },
    },
  }, {
    sequelize,
    modelName: 'seminars_listeners',
  });

  return SeminarsListeners;
}
async function recreateAndFillTable() {
  await SeminarsListeners.sync({ force: true }).then(
    () => {
      fakePairs.forEach(el => SeminarsListeners.create({
        seminar_id: el.seminar_id,
        listener_id: el.listener_id,
      }));
    },
  );
}

export async function generateSeminarsListeners(sequelize, models) {
  initSeminarsListeners(sequelize, models);
  await recreateAndFillTable();

  return SeminarsListeners;
}

export async function checkIfExists(seminar_id, listener_id) {
  return await SeminarsListeners.findAll({ where: { seminar_id, listener_id } }).then(seminars_listeners => {return seminars_listeners.length});
}

export async function updateOne(id, editedInfo) {
  return await SeminarsListeners.update(editedInfo, { where: { id } }).then(seminar_listener => seminar_listener);
}

export async function createOne(newItem) {
  return await SeminarsListeners.create(newItem).then(seminar_listener => seminar_listener);
}

export async function deleteOne(id) {
  return await SeminarsListeners.destroy({ where: { id } }).then(() => 'success');
}
