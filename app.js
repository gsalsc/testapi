const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userRouter = require('./routers/userRouter');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Test API',
      description:
        'A __test api__ coded with _node.js_ and _express_. It allows access to the user resource.',
      version: '1.0.0',
    },
    servers: [{ url: 'http://localhost:3000/' }],
  },
  apis: ['./routers/*.js', './docs/schemas.js'],
};

const openapiSpecification = swaggerJsdoc(options);

/////////////////////////////////////////////
const app = express();
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification));
app.use(cookieParser());
app.use(cors());
app.options('*', cors());
app.use(express.json());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
///////////////////////////////////////////
app.use('/api/v1/users', userRouter);
///////////////////////////////////////////
module.exports = app;
