const User = require('../models/user');

const INCORRECT_DATA_ERROR = 400;
const NOT_FOUND_ERROR = 404;
const SERVER_ERROR = 500;

const createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((users) => res.send(users))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res
          .status(INCORRECT_DATA_ERROR)
          .send({ message: 'Переданы некорректные данные' });
      } else {
        res
          .status(SERVER_ERROR)
          .send({ message: 'Ошибка на сервере' });
      }
    });
};

const getAllUsers = (req, res) => {
  User.find({}, '-__v')
    .then((users) => res.send(users))
    .catch(() => {
      res.status(SERVER_ERROR).send({ message: 'Ошибка на сервере' });
    });
};

const getUserById = (req, res) => {
  const { userId } = req.params;
  User.findById(userId, '-__v')

    .then((user) => {
      if (user) {
        res.send(user);
      } else {
        res.status(NOT_FOUND_ERROR).send({ message: 'Запрашиваемый пользователь не найден' });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res
          .status(INCORRECT_DATA_ERROR)
          .send({ message: 'Переданы некорректные данные' });
      } else {
        res
          .status(SERVER_ERROR)
          .send({ message: 'Ошибка на сервере' });
      }
    });
};

const updUserAvatar = (req, res) => {
  const userId = req.user._id;
  const { avatar } = req.body;

  User.findByIdAndUpdate(
    userId,
    { avatar },
    {
      new: true,
      runValidators: true,
      select: '-__v',
    },
  )
    .orFail()
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res
          .status(INCORRECT_DATA_ERROR)
          .send({ message: 'Переданы некорректные данные' });
      } else if (err.name === 'DocumentNotFoundError') {
        res.status(NOT_FOUND_ERROR).send({ message: 'Запрашиваемый пользователь не найден' });
      } else {
        res
          .status(SERVER_ERROR)
          .send({ message: 'Ошибка на сервере' });
      }
    });
};

const updUserInfo = (req, res) => {
  const userId = req.user._id;
  const { name, about } = req.body;

  User.findByIdAndUpdate(
    userId,
    { name, about },
    {
      new: true,
      runValidators: true,
      select: '-__v',
    },
  )
    .orFail()
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res
          .status(INCORRECT_DATA_ERROR)
          .send({ message: 'Переданы некорректные данные' });
      } else if (err.name === 'DocumentNotFoundError') {
        res.status(NOT_FOUND_ERROR).send({ message: 'Запрашиваемый пользователь не найден' });
      } else {
        res
          .status(SERVER_ERROR)
          .send({ message: 'Ошибка на сервере' });
      }
    });
};

module.exports = {
  getAllUsers,
  createUser,
  getUserById,
  updUserInfo,
  updUserAvatar,
};
