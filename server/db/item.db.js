const {query, getValue, transaction, getClient, clientGetValue, clientQuery} = require('./core');
const {getTagsForMem, addTagsToMem, changeTagsForMem} = require('./tag.db');
const {mdToPlain} = require('mdutils');

async function addItem(userId, text, tags) {
    return transaction(async function (client) {
        const now = new Date();
        const plainText = mdToPlain(text);

        const textSQL = `
            INSERT INTO text (account_id, text, plain_text, time)
            VALUES ($1, $2, $3, $4)
            RETURNING text_id
        `;
        const textValues = [userId, text, plainText, now];
        const textId = await clientGetValue(client, textSQL, textValues, 'text_id');

        const memSQL = `
            INSERT INTO mem (account_id, text_id, create_time, last_change_time)
            VALUES ($1, $2, $3, $4)
            RETURNING mem_id
        `;
        const memValues = [userId, textId, now, now];
        const memId = await clientGetValue(client, memSQL, memValues, 'mem_id');

        const memTextSQL = `
            INSERT INTO mem_text (mem_id, text_id)
            VALUES ($1, $2)
        `;
        const memTextValues = [memId, textId];
        await clientQuery(client, memTextSQL, memTextValues);

        await addTagsToMem(client, userId, memId, tags);

        return {
            memId,
            textId,
        };
    });
}

async function getItem(userId, memId) {
    const memSQL = `
        SELECT text_id
        FROM mem
        WHERE account_id = $1
          AND mem_id = $2
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
        WHERE account_id = $1
          AND text_id = $2
    `;
    const textValues = [userId, textId];
    const text = await getValue(textSQL, textValues, 'text');
    const tags = await getTagsForMem(userId, memId);

    return {
        ok: true,
        textId,
        text,
        tags,
    };
}

async function reSaveItem(userId, memId, text, tags) {
    return transaction(async function (client) {
        const now = new Date();
        const plainText = mdToPlain(text);

        const textSQL = `
            INSERT INTO text (account_id, text, plain_text, time)
            VALUES ($1, $2, $3, $4)
            RETURNING text_id
        `;
        const textValues = [userId, text, plainText, now];
        const textId = await clientGetValue(client, textSQL, textValues, 'text_id');

        const memSQL = `
            UPDATE mem
            SET text_id          = $1,
                last_change_time = $2
            WHERE account_id = $3
              AND mem_id = $4
        `;
        const memValues = [textId, now, userId, memId];
        await clientQuery(client, memSQL, memValues);

        const memTextSQL = `
            INSERT INTO mem_text (mem_id, text_id)
            VALUES ($1, $2)
        `;
        const memTextValues = [memId, textId];
        await clientQuery(client, memTextSQL, memTextValues);

        await changeTagsForMem(client, userId, memId, tags);

        return textId;
    });
}

async function updateItem(userId, memId, textId, text, tags) {
    const client = await getClient();

    try {
        await client.query('BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE');

        const getMemSQL = `
            SELECT text_id
            FROM mem
            WHERE account_id = $1
              AND mem_id = $2
        `;
        const getMemValues = [userId, memId];
        const currentTextId = await clientGetValue(client, getMemSQL, getMemValues, 'text_id');

        if (currentTextId != textId) {
            await client.query('ROLLBACK');
            return false;
        }

        const now = new Date();
        const plainText = mdToPlain(text);

        const textSQL = `
            UPDATE text
            SET text = $1,
                plain_text = $2,
                time = $3
            WHERE account_id = $4
              AND text_id = $5
        `;
        const textValues = [text, plainText, now, userId, textId];
        await clientQuery(client, textSQL, textValues);

        const memSQL = `
            UPDATE mem
            SET last_change_time = $1
            WHERE account_id = $2
              AND mem_id = $3
        `;
        const memValues = [now, userId, memId];
        await clientQuery(client, memSQL, memValues);

        await changeTagsForMem(client, userId, memId, tags);

        await client.query('COMMIT');
        return true;
    } catch (e) {
        await client.query('ROLLBACK');
        if (e.code == 40001) {
            return false;
        }
        throw e;
    } finally {
        client.release();
    }
}

async function delItem(userId, memId) {
    const delMemSQL = `
        DELETE
        FROM text
        WHERE account_id = $1
          AND text_id IN (SELECT text_id FROM mem_text WHERE mem_id = $2)
    `;
    const delMemValues = [userId, memId];
    await query(delMemSQL, delMemValues);
}

module.exports = {
    addItem,
    getItem,
    reSaveItem,
    updateItem,
    delItem,
};
