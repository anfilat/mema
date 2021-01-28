const {query, get, getValueArray, transaction, clientQuery} = require('./core');

async function getLastSearchIds(userId) {
    const sql = `
        SELECT search, search_ids
        FROM account
        WHERE account_id = $1
    `;
    const values = [userId];
    return get(sql, values);
}

async function setLastSearchIds(userId, termsStr, ids) {
    const sql = `
        UPDATE account
        SET search = $1,
            search_ids = $2
        WHERE account_id = $3
    `;
    const values = [termsStr, JSON.stringify(ids), userId];
    return query(sql, values);
}

async function listItems(userId, ids, limit, offset) {
    const listIds = ids.slice(offset, offset + limit).join(',');
    if (listIds === '') {
        return [];
    }

    const sql = `
        SELECT mem.mem_id,
               text.text,
               mem.last_change_time,
               ARRAY_AGG(tag.tag) AS tags
        FROM mem
                 LEFT JOIN text USING (text_id)
                 LEFT JOIN mem_tag USING (mem_id)
                 LEFT JOIN tag USING (tag_id)
        WHERE mem.account_id = $1
          AND mem_id IN (${listIds})
        GROUP BY mem.mem_id, text.text, mem.last_change_time
        ORDER BY array_position(array[${listIds}], mem.mem_id)
    `;
    const values = [userId];
    const res = await query(sql, values);
    return res.rows.map(item => ({
        id: item.mem_id,
        text: item.text,
        time: item.last_change_time,
        tags: item.tags[0] == null ? [] : item.tags,
    }));
}

async function searchIds(userId, termsStr, terms) {
    const currentIds = await getSearchIds(userId, terms);

    if (!termsStr) {
        return currentIds;
    }

    return transaction(async function (client) {
        const res = await readList(client, userId, termsStr);

        if (res.rowCount === 0) {
            return currentIds;
        }

        let {listId, ids, blockIds} = await parseListData(res, userId, terms);
        const current = new Set(currentIds);

        blockIds.forEach(id => {
            current.delete(id);
        });

        ids = ids.filter(id => {
            if (current.has(id)) {
                current.delete(id);
                return true;
            }
            return false;
        });

        ids.push(...Array.from(current));

        await saveList(client, userId, termsStr, listId, ids, blockIds);
        return ids;
    });
}

async function updateList(userId, termsStr, terms, func) {
    return transaction(async function (client) {
        const res = await readList(client, userId, termsStr);

        let listId;
        let ids;
        let blockIds;
        if (res.rowCount > 0) {
            ({listId, ids, blockIds} = await parseListData(res, userId, terms));
        } else {
            ids = await getSearchIds(userId, terms);
            blockIds = [];
        }

        const resUpdate = func(ids, blockIds);
        if (!resUpdate.ok) {
            return;
        }

        await saveList(client, userId, termsStr, listId, resUpdate.ids, resUpdate.blockIds);
    });
}

async function readList(client, userId, termsStr) {
    const sql = `
        SELECT list_id, search_ids, block_ids
        FROM list
        WHERE account_id = $1
          AND search = $2
        FOR UPDATE
    `;
    const values = [userId, termsStr];
    return clientQuery(client, sql, values);
}

async function saveList(client, userId, termsStr, listId, ids, blockIds) {
    const idsValue = JSON.stringify(ids);
    const blockIdsValue = JSON.stringify(blockIds);
    let updateSql;
    let updateValues;
    if (listId) {
        updateSql = `
            UPDATE list
            SET search_ids = $1,
                block_ids = $2
            WHERE list_id = $3
        `;
        updateValues = [idsValue, blockIdsValue, listId];
    } else {
        updateSql = `
            INSERT INTO list (account_id, search, search_ids, block_ids)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (account_id, search)
                DO UPDATE SET search_ids = excluded.search_ids,
                              block_ids = excluded.block_ids;
        `;
        updateValues = [userId, termsStr, idsValue, blockIdsValue];
    }
    return clientQuery(client, updateSql, updateValues);
}

async function parseListData(res) {
    const {list_id, search_ids, block_ids} = res.rows[0];

    return {
        listId: list_id,
        ids: parseArray(search_ids),
        blockIds: parseArray(block_ids),
    };
}

function parseArray(value) {
    try {
        return JSON.parse(value) ?? [];
    } catch {
        return [];
    }
}

const MaxLimit = 1000;

async function getSearchIds(userId, terms) {
    let sql;
    let values;

    if (terms.length > 0) {
        const simTerms = [];
        const sumPoints = [];
        const termConditions = [];
        const termValues = [];
        terms.forEach((term, i) => {
            const num = i + 1;
            const termI = i + 3;
            simTerms.push(`
                COALESCE((
                    SELECT similarity(tag, $${termI}) sim
                    FROM unnest(mem_with_tags.tags) AS tag
                    WHERE tag ILIKE $${termI}
                    ORDER BY sim DESC
                    LIMIT 1
                ), 0) as sim${num}
            `);
            sumPoints.push(`10 * sim${num} + similarity(text.text, $${termI})`);
            termConditions.push(`(sim${num} > 0 OR text.text ILIKE $${termI})`);
            termValues.push(`%${term}%`);
        });

        sql = `
            WITH mem_with_tags AS (
                SELECT mem_id,
                       ARRAY_AGG(tag) AS tags
                FROM mem
                         LEFT JOIN mem_tag USING (mem_id)
                         LEFT JOIN tag USING (tag_id)
                WHERE mem.account_id = $1
                GROUP BY mem_id
            ),
            mem_with_sim AS (
                SELECT mem_id,
                       tags,
                       ${simTerms.join(',')}
                FROM mem_with_tags
            )
            SELECT mem.mem_id,
                   ${sumPoints.join(' + ')} AS sumSim
            FROM mem
                     LEFT JOIN text USING(text_id)
                     JOIN mem_with_sim USING (mem_id)
            WHERE mem.account_id = $1
              AND ${termConditions.join(' AND ')}
            ORDER BY sumSim DESC
            LIMIT $2
        `;
        values = [userId, MaxLimit, ...termValues];
    } else {
        sql = `
            SELECT mem_id
            FROM mem
            WHERE account_id = $1
            ORDER BY last_change_time desc
            LIMIT $2
        `;
        values = [userId, MaxLimit];
    }
    return await getValueArray(sql, values, 'mem_id');
}

module.exports = {
    getLastSearchIds,
    setLastSearchIds,
    listItems,
    updateList,
    searchIds,
}
