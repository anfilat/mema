const {query, get, getValue} = require('./core');

async function addUser(email, hashedPassword) {
    const checkUserSQL = 'SELECT Count(*) AS count FROM "user" WHERE email = $1';
    const checkUserValues = [email];
    const count = await getValue(checkUserSQL, checkUserValues, 'count');
    if (count != 0) {
        return false;
    }

    const sql = 'INSERT INTO "user" (email, password) VALUES ($1, $2)';
    const values = [email, hashedPassword];
    try {
        await query(sql, values);
        return true;
    } catch (err) {
        if (err.constraint === 'user_email_key') {
            return false;
        }
        throw err;
    }
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
