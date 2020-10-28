const {getValueArray, clientQuery, clientGetValue, clientGetValueArray} = require('./core');

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

async function addTagsToMem(client, userId, memId, tags) {
    if (tags == null || tags.length === 0) {
        return;
    }

    const {newTagIds, ids} = await getNewTags(client, userId, tags);
    await clientQuery(client, insertTagsToMemSQL(newTagIds), insertTagsToMemValues(newTagIds, memId));
    return updateTagsTime(client, ids);
}

async function changeTagsForMem(client, userId, memId, tags) {
    if (tags == null || tags.length === 0) {
        return deleteAllTagsForMem(client, memId);
    }

    let oldIds = await getTagIdsForMem(client, memId);
    const {oldTagIds, newTagIds, ids} = await getNewTags(client, userId, tags, oldIds);
    await deleteTagsForMem(client, memId, oldTagIds);
    if (newTagIds.length > 0) {
        await clientQuery(client, insertTagsToMemSQL(newTagIds), insertTagsToMemValues(newTagIds, memId));
    }
    return updateTagsTime(client, ids);
}

async function getNewTags(client, userId, tags, oldIds = []) {
    const ids = [];
    const newTagIds = [];
    let oldTagIds = oldIds;
    for (const tag of tags) {
        const tagId = await tagToTagId(client, userId, tag);
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

async function tagToTagId(client, userId, tag) {
    const tagId = await getTagId(client, userId, tag);
    if (tagId) {
        return tagId;
    }

    try {
        const sql = `
            INSERT INTO tag (account_id, tag, time)
            VALUES ($1, $2, $3)
            RETURNING tag_id
        `;
        const values = [userId, tag, new Date()];
        return clientGetValue(client, sql, values, 'tag_id');
    } catch (err) {
        if (err.constraint === 'tag_account_id_tag') {
            return getTagId(client, userId, tag);
        }
        throw err;
    }
}

async function getTagId(client, userId, tag) {
    const sql = `
        SELECT tag_id
        FROM tag
        WHERE account_id = $1
          AND tag = $2
    `;
    const values = [userId, tag];
    return clientGetValue(client, sql, values, 'tag_id');
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

async function getTagIdsForMem(client, memId) {
    const sql = `
        SELECT tag_id FROM mem_tag
        WHERE mem_id = $1
    `;
    const values = [memId];
    return clientGetValueArray(client, sql, values, 'tag_id');
}

module.exports = {
    listTags,
    addTagsToMem,
    changeTagsForMem,
};
