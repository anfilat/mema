const {get, getValue} = require('./core');
const {hashPassword} = require('../helpers/password');

async function addAccount(email, password) {
    email = email.toLowerCase();

    const checkAccountSQL = `
        SELECT Count(*) AS count
        FROM account
        WHERE email = $1
    `;
    const checkAccountValues = [email];
    const count = await getValue(checkAccountSQL, checkAccountValues, 'count');
    if (count != 0) {
        return null;
    }

    const addAccountSQL = `
        INSERT INTO account (email, password)
        VALUES ($1, $2)
        RETURNING account_id
    `;
    const hashedPassword = await hashPassword(password);
    const addAccountValues = [email, hashedPassword];
    try {
        const accountId = await getValue(addAccountSQL, addAccountValues, 'account_id');
        return {
            account_id: +accountId
        };
    } catch (err) {
        if (err.constraint === 'account_email_key') {
            return null;
        }
        throw err;
    }
}

async function getAccount(email) {
    email = email.toLowerCase();

    const sql = 'SELECT * FROM account WHERE email = $1';
    const values = [email];
    return get(sql, values);
}

module.exports = {
    addAccount,
    getAccount,
};
