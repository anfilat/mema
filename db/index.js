const {initDb} = require('./core');
const {addAccount, getAccount} = require('./auth.db');

module.exports = {
    initDb,
    addAccount,
    getAccount,
};
