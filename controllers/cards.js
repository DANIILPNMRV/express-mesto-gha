const Card = require('../models/card');

const INCORRECT_DATA_ERROR = 400;
const NOT_FOUND_ERROR = 404;
const SERVER_ERROR = 500;

const getAllCards = (req, res) => {
  Card.find({}, '-__v')
    .then((cards) => res.send(cards))
    .catch(() => {
      res.status(SERVER_ERROR).send({ message: 'Ошибка на сервере' });
    });
};

const createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res
          .status(INCORRECT_DATA_ERROR)
          .send({ message: 'Переданы некорректные данные карточки' });
      } else {
        res
          .status(SERVER_ERROR)
          .send({ message: 'Ошибка на сервере' });
      }
    });
};

const setCardLike = (req, res) => {
  const { cardId } = req.params;
  Card.findByIdAndUpdate(
    cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true, select: '-__v' },
  )
    .orFail()
    .then((card) => {
      if (card) {
        res.send({ message: 'Лайк добавлен' });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(INCORRECT_DATA_ERROR).send({
          message: 'Переданы некорректные данные для добавления лайка.',
        });
      } else if (err.name === 'DocumentNotFoundError') {
        res
          .status(NOT_FOUND_ERROR)
          .send({ message: 'Передан несуществующий _id карточки' });
      } else {
        res
          .status(SERVER_ERROR)
          .send({ message: 'Ошибка на сервере' });
      }
    });
};

const deleteCardLike = (req, res) => {
  const { cardId } = req.params;
  Card.findByIdAndUpdate(
    cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail()
    .then((card) => {
      if (card) {
        res.send({ message: 'Лайк удалён' });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res
          .status(INCORRECT_DATA_ERROR)
          .send({ message: 'Переданы некорректные данные для удаления лайка.' });
      } else if (err.name === 'DocumentNotFoundError') {
        res
          .status(404)
          .send({ message: 'Передан несуществующий _id карточки' });
      } else {
        res
          .status(SERVER_ERROR)
          .send({ message: 'Ошибка на сервере' });
      }
    });
};

const deleteCardById = (req, res) => {
  const { cardId } = req.params;
  Card.findByIdAndRemove(cardId, { select: '-__v' })
    .orFail()
    .then((card) => {
      if (card) {
        res.send({ message: 'Карточка удалена' });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res
          .status(INCORRECT_DATA_ERROR)
          .send({ message: 'Введены не корректные данные' });
      } else if (err.name === 'DocumentNotFoundError') {
        res
          .status(NOT_FOUND_ERROR)
          .send({ message: 'Карточка с указанным _id не найдена.' });
      } else {
        res
          .status(SERVER_ERROR)
          .send({ message: 'Ошибка на сервере' });
      }
    });
};

module.exports = {
  getAllCards,
  createCard,
  deleteCardById,
  setCardLike,
  deleteCardLike,
};
