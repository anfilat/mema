const path = require('path');
const express = require('express');
require('express-async-errors');
const morgan = require('morgan');
const db = require('./db');

const app = express();
app.disable('x-powered-by');

app.use(morgan('common'));

app.use(express.json({extended: true}));

app.use('/api/auth', require('./routes/auth.routes'));

app.use('/api/', (req, res, next) => {
    res
        .status(404)
        .send('404 - Not Found\n');
});

app.use('/', express.static(path.join(__dirname, '..', 'client', 'build')));

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'client', 'build', 'index.html'));
});

db.initDb();

module.exports = app;
