const {initDb, initFakeDb} = require('./core');
const {addAccount, getAccount} = require('./auth.db');
const {addItem} = require('./item.db');

module.exports = {
    initDb,
    initFakeDb,

    addAccount,
    getAccount,

    addItem,
};
