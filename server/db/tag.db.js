const {getValueArray, clientQuery, clientGetValue} = require('./core');

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

async function addTagsToMem(client, userId, memId, tags) {
    if (tags == null || tags.length === 0) {
        return;
    }

    const ids = [];
    const sql = `
        INSERT INTO mem_tag (mem_id, tag_id)
        VALUES ($1, $2)
    `;
    for (const tag of tags) {
        const tagId = await tagToTagId(client, userId, tag);
        const values = [memId, tagId];
        await clientQuery(client, sql, values);
        ids.push(tagId);
    }

    const updateTimeSQL = `
        UPDATE tag
        SET time = $1
        WHERE tag_id = ANY($2)
    `;
    const updateTimeValues = [new Date(), ids];
    await clientQuery(client, updateTimeSQL, updateTimeValues);
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

module.exports = {
    listTags,
    addTagsToMem,
};
