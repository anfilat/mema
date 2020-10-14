const {initDb} = require('./core');
const {addAccount, getAccount} = require('./auth.db');
const {addItem, resaveItem, updateItem, delItem} = require('./item.db');
const {addToken, getToken, delToken, delAccountTokens} = require('./jwt.db');

module.exports = {
    initDb,

    addAccount,
    getAccount,

    addItem,
    resaveItem,
    updateItem,
    delItem,

    addToken,
    getToken,
    delToken,
    delAccountTokens,
};
