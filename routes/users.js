const express = require('express');
const { celebrate, Joi } = require('celebrate');
const { urlValidator } = require('../validator');

const router = express.Router();

const {
  getAllUsers,
  getUserById,
  updUserInfo,
  updUserAvatar,
  getUserHimself,
} = require('../controllers/users');

router.get('/', getAllUsers);
router.get('/me', getUserHimself);

router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().required().length(24).hex(),
  }),
}), getUserById);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
}), updUserInfo);

router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().regex(urlValidator),
  }),
}), updUserAvatar);

module.exports = router;
