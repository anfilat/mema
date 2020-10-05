const {initDb, initFakeDb} = require('./core');
const {addAccount, getAccount} = require('./auth.db');

module.exports = {
    initDb,
    initFakeDb,
    addAccount,
    getAccount,
};
