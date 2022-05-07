/* eslint-disable no-console */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const db = process.env.DB_CONNECTION_LOCAL;
mongoose.connect(db).then(() => {
  console.log('db connection established');
});

const app = require('./app');
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`server is running on port ${port}`));
