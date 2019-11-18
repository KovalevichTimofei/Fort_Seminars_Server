import Sequelize, { Op } from 'sequelize';
import { generateId } from '../plugins';

const fakeLessons = [
  {
    id: '1',
    info: 'Часть 1 семинара "Душепопечение, как это работает"',
    part_numb: 1,
    date: new Date(2019, 8, 5),
    abstract: '',
    seminar_id: '1',
  },
  {
    id: '2',
    info: 'Часть 2 семинара "Душепопечение, как это работает"',
    part_numb: 2,
    date: new Date(2019, 8, 12),
    abstract: '',
    seminar_id: '1',
  },
  {
    id: '3',
    info: 'Часть 3 семинара "Душепопечение, как это работает"',
    part_numb: 3,
    date: new Date(2019, 8, 19),
    abstract: '',
    seminar_id: '1',
  },
  {
    id: '4',
    info: 'Часть 4 семинара "Душепопечение, как это работает"',
    part_numb: 4,
    date: new Date(2019, 8, 26),
    abstract: '',
    seminar_id: '1',
  },
  {
    id: '5',
    info: 'Часть 1 семинара "Духовная брань"',
    part_numb: 1,
    date: new Date(2019, 9, 3),
    abstract: '',
    seminar_id: '2',
  },
];

class Lessons extends Sequelize.Model {}

export function initLessons(sequelize, models) {
  const { Seminars } = models;
  Lessons.sequalize = sequelize;
  Lessons.query = sequelize.query;
  Lessons.QueryTypes = sequelize.QueryTypes;

  Lessons.init({
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      primaryKey: true,
    },
    info: {
      type: Sequelize.TEXT,
    },
    part_numb: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    date: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    abstract_link: {
      type: Sequelize.STRING,
    },
    seminar_id: {
      type: Sequelize.STRING,

      references: {
        model: Seminars,
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
      },
    },
  }, {
    sequelize,
    modelName: 'lessons',
  });

  return Lessons;
}
async function recreateAndFillTable() {
  await Lessons.sync({ force: true }).then(
    () => {
      fakeLessons.forEach(el => Lessons.create({
        id: el.id,
        seminar_id: el.seminar_id,
        part_numb: el.part_numb,
        info: el.info,
        date: el.date,
        abstract_link: el.abstract_link,
      }));
    },
  );
}

export async function generateLessons(sequelize, models) {
  initLessons(sequelize, models);
  await recreateAndFillTable();

  return Lessons;
}

export async function getAll() {
  return Lessons.findAll().then(lessons => lessons);
}

export async function getAllForCurrentSeminar(seminarId) {
  return Lessons.findAll({ where: { seminar_id: seminarId } }).then(lessons => lessons);
}

export async function getByMonth(number) {
  return Lessons.sequalize.query('SELECT * FROM lessons WHERE EXTRACT(MONTH FROM date) = :number',
    { replacements: { number } },
    { type: Lessons.sequalize.QueryTypes.SELECT })
    .then(lessons => lessons[0]);
}

export async function getFirstFutureLesson() {
  return Lessons.findAll(
    {
      where: {
        date: {
          [Op.gte]: Date.now(),
        },
      },
    },
  ).then(lessons => lessons[0]);
}

export async function getOne(id) {
  return Lessons.findAll({ where: { id } }).then(lessons => lessons[0]);
}

export async function updateOne(id, editedInfo) {
  await Lessons.update(editedInfo, { where: { id } });
  const editedLesson = await getOne(id);

  editedLesson.dataValues.date = editedInfo.date;
  return editedLesson;
}

export async function createOne(newItem) {
  if (!newItem.id) newItem.id = generateId();
  return Lessons.create(newItem).then(lesson => {
    lesson.dataValues.date = newItem.date;
    return lesson;
  });
}

export async function deleteOne(id) {
  return Lessons.destroy({ where: { id } }).then(() => 'success');
}

export async function deleteBySeminarId(id) {
  return await Lessons.destroy({ where: { seminar_id: id } }).then(() => 'success');
}
