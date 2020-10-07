const {initDb} = require('./core');
const {addAccount, getAccount} = require('./auth.db');
const {addItem} = require('./item.db');

module.exports = {
    initDb,

    addAccount,
    getAccount,

    addItem,
};
