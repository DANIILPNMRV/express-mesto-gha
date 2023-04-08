const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

const User = require('../models/user');

const { NotFoundError } = require('../errors/not-found-error');
const { IncorrectDataError } = require('../errors/incorrect-data-error');
const { ConflictError } = require('../errors/conflict-error');
const { UnauthorizedError } = require('../errors/unauthorized-error');

const SUCCESS = 200;
const SUCCESS_CREATE = 201;

const createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then((user) => res.status(SUCCESS_CREATE).send({
      data: {
        name: user.name,
        about: user.about,
        avatar: user.avatar,
        email: user.email,
        _id: user._id,
      },
    }))
    .catch((err) => {
      if (err.name === 'IncorrectDataError') {
        next(new IncorrectDataError('Переданы некорректные данные'));
        return;
      }
      if (err.code === 11000) {
        next(new ConflictError('Пользователь с указанной почтой уже создан'));
        return;
      }
      next(err);
    });
};

const getAllUsers = (req, res, next) => {
  User.find({}, '-__v')
    .then((users) => res.status(SUCCESS).send(users))
    .catch(next);
};

const getUserById = (req, res, next) => {
  const { userId } = req.params;
  User.findById(userId, '-__v')
    .then((user) => {
      if (user === null) {
        next(new NotFoundError('Запрашиваемый пользователь не найден'));
        return;
      }
      res.status(SUCCESS).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new IncorrectDataError('Введены некорректные данные'));
        return;
      }
      next(err);
    });
};

const updUserAvatar = (req, res, next) => {
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
    .then((user) => {
      if (user === null) {
        next(new NotFoundError('Пользователь не найден'));
        return;
      }
      res.status(SUCCESS).send(user);
    })
    .catch((err) => {
      if (err.name === 'IncorrectDataError') {
        next(new IncorrectDataError('Введены некорректные данные'));
        return;
      }
      next(err);
    });
};

const updUserInfo = (req, res, next) => {
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
    .then((user) => {
      if (user === null) {
        next(new NotFoundError('Пользователь не найден'));
        return;
      }
      res.status(SUCCESS).send(user);
    })
    .catch((err) => {
      if (err.name === 'IncorrectDataError') {
        next(new IncorrectDataError('Введены некорректные данные'));
        return;
      }
      next(err);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  User
    .findOne({ email }).select('+password')
    .orFail(() => { throw new UnauthorizedError('Некорректная почта или пароль'); })
    .then((user) => bcrypt.compare(password, user.password).then((matched) => {
      if (matched) {
        return user;
      }
      next(new UnauthorizedError('Некорректная почта или пароль'));
      return user;
    }))
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'jwt-secret-key', { expiresIn: '7d' });
      res.send({ user, token });
    })
    .catch(next);
};

const getUserHimself = (req, res, next) => {
  const userId = req.user._id;
  User.findById(userId)
    .then((user) => res.send({ user }))
    .catch(next);
};

module.exports = {
  getAllUsers,
  createUser,
  getUserById,
  updUserInfo,
  updUserAvatar,
  getUserHimself,
  login,
};
