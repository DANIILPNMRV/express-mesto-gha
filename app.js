const express = require('express');
const mongoose = require('mongoose');
const { celebrate, Joi } = require('celebrate');
const { errors } = require('celebrate');
const bodyParser = require('body-parser');
const router = require('./routes/routes');
const { errorHandler } = require('./middlewares/errorHandler');

const auth = require('./middlewares/auth');
const { login, createUser } = require('./controllers/users');
const { NotFoundError } = require('./errors/not-found-error');
const { urlValidator } = require('./validator');

const { PORT = 3000 } = process.env;
const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/mestodb', {});

app.use(bodyParser.json());
app.use(express.json());

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().regex(urlValidator),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), createUser);

app.use(auth);
app.use('/', router);

app.use(errors());
app.use(errorHandler);
app.use((req, res, next) => {
  next(new NotFoundError('Запрашиваемой страницы не существует'));
});

app.listen(3000, () => {
  console.log(`Listing on port ${PORT}`);
});
