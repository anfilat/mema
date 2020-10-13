const {query, getValue} = require('./core');

async function addItem(userId, text) {
    const now = new Date();

    const textSQL = `
        INSERT INTO text (account_id, text, time)
        VALUES ($1, $2, $3)
        RETURNING text_id
    `;
    const textValues = [userId, text, now];
    const textId = await getValue(textSQL, textValues, 'text_id');

    const memSQL = `
        INSERT INTO mem (account_id, text_id, create_time, last_change_time)
        VALUES ($1, $2, $3, $4)
        RETURNING mem_id
    `;
    const memValues = [userId, textId, now, now];
    const memId = await getValue(memSQL, memValues, 'mem_id');

    const memTextSQL = `
        INSERT INTO mem_text (mem_id, text_id)
        VALUES ($1, $2)
    `;
    const memTextValues = [memId, textId];
    await query(memTextSQL, memTextValues);

    return memId;
}

async function delItem(userId, memId) {
    const delMemSQL = `
        DELETE
        FROM text
        WHERE text_id IN (SELECT text_id FROM mem_text WHERE mem_id = $1 AND account_id = $2)
    `;
    const delMemValues = [userId, memId];
    await query(delMemSQL, delMemValues);
}

module.exports = {
    addItem,
    delItem,
};
