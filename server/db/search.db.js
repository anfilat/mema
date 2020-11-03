const {query} = require('./core');

async function listItems(userId, text, limit = 20, offset = 0) {
    let sql;
    let values;

    if (text) {
        sql = `
            SELECT mem.mem_id,
                   text.text,
                   mem.last_change_time,
                   ARRAY_AGG(tag.tag)                                            AS tags,
                   10 * SUM(similarity(tag.tag, $1)) + similarity(text.text, $1) AS sim
            FROM mem
                     INNER JOIN mem_text ON mem.mem_id = mem_text.mem_id
                     LEFT JOIN text on mem_text.text_id = text.text_id
                     INNER JOIN mem_tag ON mem.mem_id = mem_tag.mem_id
                     LEFT JOIN tag on mem_tag.tag_id = tag.tag_id
            WHERE mem.account_id = $2
              AND (tag.tag ILIKE $1 OR text.text ILIKE $1)
            GROUP BY mem.mem_id, text.text, mem.last_change_time
            ORDER BY sim DESC, mem.last_change_time desc
            LIMIT $3 OFFSET $4
        `;
        values = [`%${text}%`, userId, limit, offset];
    } else {
        sql = `
            SELECT mem.mem_id,
                   text.text,
                   mem.last_change_time,
                   ARRAY_AGG(tag.tag) AS tags
            FROM mem
                     INNER JOIN mem_text ON mem.mem_id = mem_text.mem_id
                     LEFT JOIN text on mem_text.text_id = text.text_id
                     INNER JOIN mem_tag ON mem.mem_id = mem_tag.mem_id
                     LEFT JOIN tag on mem_tag.tag_id = tag.tag_id
            WHERE mem.account_id = $1
            GROUP BY mem.mem_id, text.text, mem.last_change_time
            ORDER BY mem.last_change_time desc
            LIMIT $2 OFFSET $3
        `;
        values = [userId, limit, offset];
    }
    const res = await query(sql, values, );
    return res.rows.map(item => ({
        id: item.mem_id,
        text: item.text,
        time: item.last_change_time,
        tags: item.tags,
    }));
}

module.exports = {
    listItems,
}
