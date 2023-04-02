const router = require('express').Router();

const {
  getAllCards,
  createCard,
  deleteCardById,
  setCardLike,
  deleteCardLike,
} = require('../controllers/cards');

router.get('/', getAllCards);
router.post('/', createCard);
router.delete('/:cardId', deleteCardById);
router.put('/:cardId/likes', setCardLike);
router.delete('/:cardId/likes', deleteCardLike);
module.exports = router;
