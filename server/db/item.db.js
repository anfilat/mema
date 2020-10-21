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

    return {
        memId,
        textId,
    };
}

async function getItem(userId, memId) {
    const memSQL = `
        SELECT text_id
        FROM mem
        WHERE account_id = $1 AND mem_id = $2
    `;
    const memValues = [userId, memId];
    const textId = await getValue(memSQL, memValues, 'text_id');

    if (!textId) {
        return {
          ok: false,
        };
    }

    const textSQL = `
        SELECT text
        FROM text
        WHERE account_id = $1 AND text_id = $2
    `;
    const textValues = [userId, textId];
    const text = await getValue(textSQL, textValues, 'text');

    return {
      ok: true,
      text,
      textId,
    };
}

async function resaveItem(userId, memId, text) {
    const now = new Date();

    const textSQL = `
        INSERT INTO text (account_id, text, time)
        VALUES ($1, $2, $3)
        RETURNING text_id
    `;
    const textValues = [userId, text, now];
    const textId = await getValue(textSQL, textValues, 'text_id');

    const memSQL = `
        UPDATE mem
        SET text_id = $1, last_change_time = $2
        WHERE account_id = $3 AND mem_id = $4
    `;
    const memValues = [textId, now, userId, memId];
    await query(memSQL, memValues);

    const memTextSQL = `
        INSERT INTO mem_text (mem_id, text_id)
        VALUES ($1, $2)
    `;
    const memTextValues = [memId, textId];
    await query(memTextSQL, memTextValues);

    return textId;
}

async function updateItem(userId, memId, textId, text) {
    const getMemSQL = `
        SELECT text_id
        FROM mem
        WHERE account_id = $1 AND mem_id = $2
    `;
    const getMemValues = [userId, memId];
    const currentTextId = await getValue(getMemSQL, getMemValues, 'text_id');

    if (currentTextId !== textId) {
        return false;
    }

    const now = new Date();
    const textSQL = `
        UPDATE text
        SET text = $1, time = $2
        WHERE account_id = $3 AND text_id = $4
    `;
    const textValues = [text, now, userId, textId];
    await query(textSQL, textValues);

    const memSQL = `
        UPDATE mem
        SET last_change_time = $1
        WHERE account_id = $2 AND mem_id = $3
    `;
    const memValues = [now, userId, memId];
    await query(memSQL, memValues);

    return true;
}

async function delItem(userId, memId) {
    const delMemSQL = `
        DELETE
        FROM text
        WHERE text_id IN (SELECT text_id FROM mem_text WHERE account_id = $1 AND mem_id = $2)
    `;
    const delMemValues = [userId, memId];
    await query(delMemSQL, delMemValues);
}

module.exports = {
    addItem,
    getItem,
    resaveItem,
    updateItem,
    delItem,
};
