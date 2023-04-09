const Card = require('../models/card');

const { NotFoundError } = require('../errors/not-found-error');
const { IncorrectDataError } = require('../errors/incorrect-data-error');
const { ForbiddenError } = require('../errors/forbidden-error');

const SUCCESS = 200;
const SUCCESS_CREATE = 201;

const getAllCards = (req, res, next) => {
  Card.find({}, '-__v')
    .populate(['owner', 'likes'])
    .then((cards) => res.status(SUCCESS).send(cards))
    .catch(next);
};

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => card.populate(['owner'])
      .then((data) => res.status(SUCCESS_CREATE)
        .send({ data })))
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new IncorrectDataError('Переданы некорректные данные'));
        return;
      }
      next(err);
    });
};

const setCardLike = (req, res, next) => {
  const userId = req.user._id;
  const { cardId } = req.params;
  Card.findByIdAndUpdate(
    cardId,
    { $addToSet: { likes: userId } },
    { new: true, select: '-__v' },
  )
    .populate(['owner', 'likes'])
    .then((card) => {
      if (card === null) {
        next(new NotFoundError('Карточка не найдена'));
        return;
      }
      res.send({ message: 'Лайк добавлен' });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new IncorrectDataError('Введены некорректные данные'));
        return;
      }
      next(err);
    });
};

const deleteCardLike = (req, res, next) => {
  const userId = req.user._id;
  const { cardId } = req.params;
  Card.findByIdAndUpdate(
    cardId,
    { $pull: { likes: userId } },
    { new: true },
  )
    .populate(['owner', 'likes'])
    .then((card) => {
      if (card === null) {
        next(new NotFoundError('Карточка не найдена'));
        return;
      }
      res.status(SUCCESS).send({ message: 'Лайк удалён' });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new IncorrectDataError('Введены некорректные данные'));
        return;
      }
      next(err);
    });
};

const deleteCardById = (req, res, next) => {
  const userId = req.user._id;
  const { cardId } = req.params;
  Card.findById(cardId, { select: '-__v' })
    .populate(['owner', 'likes'])
    .then((card) => {
      if (card === null) {
        return next(new NotFoundError('Карточка с указанным _id не найдена.'));
      }
      if (card.owner._id.toString() !== userId) {
        return next(new ForbiddenError('Удаление чужой карточки недопустимо'));
      }
      return card.deleteOne()
        .then((data) => res.status(SUCCESS).send({ data }));
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new IncorrectDataError('Введены некорректные данные'));
      }
      return next(err);
    });
};

module.exports = {
  getAllCards,
  createCard,
  deleteCardById,
  setCardLike,
  deleteCardLike,
};
