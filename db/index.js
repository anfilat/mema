const {initDb} = require('./core');
const {addUser, getUser} = require('./auth.db');

module.exports = {
    initDb,
    addUser,
    getUser,
};
