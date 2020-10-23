const {getValueArray} = require('./core');

const listLimit = 20;

async function listTags(userId, text) {
    if (text) {
        const sql = `
            SELECT tag
            FROM tag WHERE account_id = $1 AND tag ILIKE $2
            ORDER BY similarity(tag, $3) desc, time desc
            LIMIT ${listLimit};
        `;
        const values = [userId, `%${text}%`, text];
        return getValueArray(sql, values, 'tag');
    }

    const sql = `
        SELECT tag
        FROM tag WHERE account_id = $1
        ORDER BY time desc
        LIMIT ${listLimit};
    `;
    const values = [userId];
    return getValueArray(sql, values, 'tag');
}

module.exports = {
    listTags,
};
