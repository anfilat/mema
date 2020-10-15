const {query, get} = require('./core');

async function addToken(userId, token) {
    const sql = `
        INSERT INTO token (token, account_id)
        VALUES ($1, $2)
    `;
    const values = [token, userId];
    return query(sql, values);
}

async function getToken(token) {
    const sql = `SELECT token, account_id FROM token WHERE token = $1`;
    const values = [token];
    const data = await get(sql, values);

    if (data) {
        return {
            userId: data.account_id,
            token: data.token,
        }
    }
    return null;
}

async function delToken(token) {
    const sql = `DELETE FROM token WHERE token = $1`;
    const values = [token];
    return query(sql, values);
}

module.exports = {
    addToken,
    getToken,
    delToken,
};
