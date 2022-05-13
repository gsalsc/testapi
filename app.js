const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const tourRouter = require('./routers/tourRouter');
const userRouter = require('./routers/userRouter');
const app = express();
app.use(cookieParser());
app.use(cors());
app.options('*', cors());
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
