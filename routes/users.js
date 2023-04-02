const express = require('express');

const router = express.Router();

const {
  getAllUsers,
  createUser,
  getUserById,
  updUserInfo,
  updUserAvatar,
} = require('../controllers/users');

router.get('/', getAllUsers);

router.post('/', createUser);

router.get('/:userId', getUserById);

router.patch('/me', updUserInfo);

router.patch('/me/avatar', updUserAvatar);

module.exports = router;
