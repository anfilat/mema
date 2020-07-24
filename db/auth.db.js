const {query, get, getValue} = require('./core');

async function addAccount(email, hashedPassword) {
    const checkAccountSQL = 'SELECT Count(*) AS count FROM account WHERE email = $1';
    const checkAccountValues = [email];
    const count = await getValue(checkAccountSQL, checkAccountValues, 'count');
    if (count != 0) {
        return false;
    }

    const sql = 'INSERT INTO account (email, password) VALUES ($1, $2)';
    const values = [email, hashedPassword];
    try {
        await query(sql, values);
        return true;
    } catch (err) {
        if (err.constraint === 'account_email_key') {
            return false;
        }
        throw err;
    }
}

async function getAccount(email) {
    const sql = 'SELECT * FROM account WHERE email = $1';
    const values = [email];
    return get(sql, values);
}

module.exports = {
    addAccount,
    getAccount,
};
