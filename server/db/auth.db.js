const {query, get, getValue} = require('./core');

async function addAccount(email, hashedPassword) {
    const checkAccountSQL = 'SELECT Count(*) AS count FROM account WHERE email = $1';
    const checkAccountValues = [email];
    const count = await getValue(checkAccountSQL, checkAccountValues, 'count');
    if (count != 0) {
        return null;
    }

    const sql = 'INSERT INTO account (email, password) VALUES ($1, $2) RETURNING account_id';
    const values = [email, hashedPassword];
    try {
        const res = await query(sql, values);
        return {
            account_id: res.rows[0].account_id
        };
    } catch (err) {
        if (err.constraint === 'account_email_key') {
            return null;
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
