const {initDb} = require('./core');
const {addAccount, getAccount} = require('./auth.db');
const {addItem, getItem, reSaveItem, updateItem, delItem} = require('./item.db');
const {listTags} = require('./tag.db');
const {addToken, getToken, delToken} = require('./token.db');

module.exports = {
    initDb,

    addAccount,
    getAccount,

    addItem,
    getItem,
    reSaveItem,
    updateItem,
    delItem,

    listTags,

    addToken,
    getToken,
    delToken,
};
