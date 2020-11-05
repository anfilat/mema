const {query} = require('./core');

async function listItems(userId, terms, limit, offset) {
    let sql;
    let values;

    if (terms.length > 0) {
        const sumPoints = [];
        const termConditions = [];
        const termValues = [];
        let i = 4;
        terms.forEach(term => {
            sumPoints.push(`10 * SUM(similarity(tag.tag, $${i})) + similarity(text.text, $${i})`);
            termConditions.push(`tag.tag ILIKE $${i} OR text.text ILIKE $${i}`);
            termValues.push(`%${term}%`);
            i++;
        });

        sql = `
            SELECT mem.mem_id,
                   text.text,
                   mem.last_change_time,
                   ARRAY_AGG(tag.tag)       AS tags,
                   ${sumPoints.join(' + ')} AS sim
            FROM mem
                     INNER JOIN mem_text ON mem.mem_id = mem_text.mem_id
                     LEFT JOIN text on mem_text.text_id = text.text_id
                     INNER JOIN mem_tag ON mem.mem_id = mem_tag.mem_id
                     LEFT JOIN tag on mem_tag.tag_id = tag.tag_id
            WHERE mem.account_id = $1
              AND (${termConditions.join(' OR ')})
            GROUP BY mem.mem_id, text.text, mem.last_change_time
            ORDER BY sim DESC, mem.last_change_time desc
            LIMIT $2 OFFSET $3
        `;
        values = [userId, limit, offset, ...termValues];
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
