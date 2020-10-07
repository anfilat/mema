const express = require('express');
require('express-async-errors');
const morgan = require('morgan');
require('dotenv').config();
const setupAPI = require('./app.api');
const setupStatic = require('./app.static');

const app = express();

app.disable('x-powered-by');

app.use(morgan('common'));

app.use(express.json({extended: true}));

setupAPI(app);
setupStatic(app);

module.exports = app;
