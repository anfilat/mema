const {getValueArray, clientQuery, clientGetValueArray} = require('./core');

const listLimit = 20;

async function listTags(userId, text, prevTags) {
    const isPrevTags = prevTags.length > 0;
    let sql;
    let values;

    if (text && isPrevTags) {
        sql = `
            SELECT tag
            FROM tag
            WHERE account_id = $1
              AND tag ILIKE $2
              AND tag != ALL($3)
            ORDER BY similarity(tag, $4) desc, time desc
            LIMIT ${listLimit};
        `;
        values = [userId, `%${text}%`, prevTags, text];
    } else if (text) {
        sql = `
            SELECT tag
            FROM tag
            WHERE account_id = $1
              AND tag ILIKE $2
            ORDER BY similarity(tag, $3) desc, time desc
            LIMIT ${listLimit};
        `;
        values = [userId, `%${text}%`, text];
    } else if (isPrevTags) {
        sql = `
            SELECT tag
            FROM tag
            WHERE account_id = $1
              AND tag != ALL($2)
            ORDER BY time desc
            LIMIT ${listLimit};
        `;
        values = [userId, prevTags];
    } else {
        sql = `
            SELECT tag
            FROM tag
            WHERE account_id = $1
            ORDER BY time desc
            LIMIT ${listLimit};
        `;
        values = [userId];
    }
    return getValueArray(sql, values, 'tag');
}

async function getTagsForMem(userId, memId) {
    const sql = `
        SELECT tag
        FROM tag
        LEFT JOIN mem_tag on tag.tag_id = mem_tag.tag_id
        WHERE account_id = $1
          AND mem_id = $2;
    `;
    const values = [userId, memId];
    return getValueArray(sql, values, 'tag');
}

async function addTagsToMem(client, userId, memId, tags) {
    if (tags == null || tags.length === 0) {
        return true;
    }

    const tagIds = await getTagIdsForTags(client, userId, tags);
    if (tagIds === false) {
        return false;
    }
    const {newTagIds, ids} = await getNewTags(client, userId, tagIds);
    await clientQuery(client, insertTagsToMemSQL(newTagIds), insertTagsToMemValues(newTagIds, memId));
    await updateTagsTime(client, ids);
    return true;
}

async function changeTagsForMem(client, userId, memId, tags) {
    if (tags == null || tags.length === 0) {
        await deleteAllTagsForMem(client, memId);
        return true;
    }

    let oldIds = await getTagIdsForMem(client, memId);
    const tagIds = await getTagIdsForTags(client, userId, tags);
    if (tagIds === false) {
        return false;
    }
    const {oldTagIds, newTagIds, ids} = await getNewTags(client, userId, tagIds, oldIds);
    await deleteTagsForMem(client, memId, oldTagIds);
    if (newTagIds.length > 0) {
        await clientQuery(client, insertTagsToMemSQL(newTagIds), insertTagsToMemValues(newTagIds, memId));
    }
    await updateTagsTime(client, ids);
    return true;
}

async function getTagIdsForMem(client, memId) {
    const sql = `
        SELECT tag_id FROM mem_tag
        WHERE mem_id = $1
    `;
    const values = [memId];
    return clientGetValueArray(client, sql, values, 'tag_id');
}

async function getTagIdsForTags(client, userId, tags) {
    const getSQL = `
        SELECT tag_id, tag
        FROM tag
        WHERE account_id = $1
          AND tag = ANY($2);
    `;
    const getValues = [userId, tags];
    const res = await clientQuery(client, getSQL, getValues);
    const ids = [];
    let missedTags = [...tags];
    if (res.rowCount > 0) {
        for (let i = 0; i < res.rowCount; i++) {
            const {tag, tag_id} = res.rows[i];
            ids.push(tag_id);
            missedTags = missedTags.filter(item => item !== tag);
        }
    }
    if (missedTags.length === 0) {
        return ids;
    }

    const now = new Date();
    const sqlValues = [];
    const insertValues = [];
    for (let i = 0; i < missedTags.length; i++) {
        sqlValues.push(`($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`);
        insertValues.push(userId, missedTags[i], now);
    }
    const insertSQL = 'INSERT INTO tag (account_id, tag, time) VALUES ' +
        sqlValues.join(', ') +
        'RETURNING *';
    try {
        const tagIds = await clientGetValueArray(client, insertSQL, insertValues, 'tag_id');
        ids.push(...tagIds);
    } catch (err) {
        if (err.constraint === 'tag_account_id_tag') {
            return false;
        }
        throw err;
    }
    return ids;
}

async function getNewTags(client, userId, tagIds, oldIds = []) {
    const ids = [];
    const newTagIds = [];
    let oldTagIds = oldIds;
    for (const tagId of tagIds) {
        ids.push(tagId);

        if (oldTagIds.includes(tagId)) {
            oldTagIds = oldTagIds.filter(item => item !== tagId);
        } else {
            newTagIds.push(tagId);
        }
    }
    return {ids, oldTagIds, newTagIds};
}

function insertTagsToMemSQL(ids) {
    const sqlValues = [];
    for (let i = 0; i < ids.length; i++) {
        sqlValues.push(`($${i * 2 + 1}, $${i * 2 + 2})`);
    }
    return 'INSERT INTO mem_tag (mem_id, tag_id) VALUES ' + sqlValues.join(', ');
}

function insertTagsToMemValues(ids, memId) {
    const values = [];
    for (let i = 0; i < ids.length; i++) {
        values.push(memId, ids[i]);
    }
    return values;
}

async function updateTagsTime(client, ids) {
    const sql = `
        UPDATE tag
        SET time = $1
        WHERE tag_id = ANY($2)
    `;
    const values = [new Date(), ids];
    return clientQuery(client, sql, values);
}

async function deleteAllTagsForMem(client, memId) {
    const sql = `
        DELETE FROM mem_tag
        WHERE mem_id = $1
    `;
    const values = [memId];
    return clientQuery(client, sql, values);
}

async function deleteTagsForMem(client, memId, ids) {
    if (ids.length === 0) {
        return;
    }

    const sql = `
        DELETE FROM mem_tag
        WHERE mem_id = $1
          AND tag_id = ANY($2)
    `;
    const values = [memId, ids];
    return clientQuery(client, sql, values);
}

module.exports = {
    listTags,
    getTagsForMem,
    addTagsToMem,
    changeTagsForMem,
};
