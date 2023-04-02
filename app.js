const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/users');
const cardRoutes = require('./routes/cards');

const app = express();
const NOT_FOUND_ERROR = 404;

mongoose.connect('mongodb://127.0.0.1:27017/mestodb', {});

app.use(bodyParser.json());

app.use((req, res, next) => {
  req.user = {
    _id: '642a0007330dc83c57d5b419',
  };

  next();
});

const { PORT = 3000 } = process.env;

app.listen(3000, () => {
  console.log(`Listing on port ${PORT}`);
});

app.use('/users', userRoutes);
app.use('/cards', cardRoutes);
app.use('', (req, res) => res.status(NOT_FOUND_ERROR).send({ message: 'Запрашиваемой страницы не существует' }));
