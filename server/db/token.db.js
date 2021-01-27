const {query, get} = require('./core');

async function addToken(userId, token, expires) {
    const sql = `
        INSERT INTO token (token, account_id, expires)
        VALUES ($1, $2, $3)
        ON CONFLICT (token)
        DO UPDATE SET expires = $3
    `;
    const values = [token, userId, expires];
    try {
        await query(sql, values);
    } catch (err) {
        console.error('add token:', err);
    }
}

async function getToken(token) {
    const sql = `
        SELECT token, account_id
        FROM token
        WHERE token = $1
    `;
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
    const sql = `
        DELETE FROM token
        WHERE token = $1
    `;
    const values = [token];
    await query(sql, values);
}

async function deleteOldTokens() {
    const sql = `
        DELETE FROM token
        WHERE expires < $1
    `;
    const values = [new Date()];
    const res = await query(sql, values);
    return res.rowCount;
}

module.exports = {
    addToken,
    getToken,
    delToken,
    deleteOldTokens,
};
