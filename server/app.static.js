const path = require('path');
const express = require('express');

module.exports = function setupStatic(app) {
    app.use('/', express.static(path.join(__dirname, '..', 'client', 'build')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '..', 'client', 'build', 'index.html'));
    });
}
