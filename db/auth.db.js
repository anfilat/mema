const {pool, get} = require('./core');

async function addUser(email, password) {
    const sql = 'INSERT INTO "user" (email, password) VALUES ($1, $2)';
    const values = [email, password];
    return pool.query(sql, values);
}

async function getUser(email) {
    const sql = 'SELECT * FROM "user" WHERE email = $1';
    const values = [email];
    return get(sql, values);
}

module.exports = {
    addUser,
    getUser,
};
