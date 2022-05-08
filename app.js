const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const tourRouter = require('./routers/tourRouter');
const userRouter = require('./routers/userRouter');
const app = express();

app.use(cors());
app.options('*', cors());

app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use(express.static(`${__dirname}/public`));

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
