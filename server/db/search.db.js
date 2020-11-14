const {query} = require('./core');

async function listItems(userId, terms, limit, offset) {
    let sql;
    let values;

    if (terms.length > 0) {
        const simTerms = [];
        const sumPoints = [];
        const termConditions = [];
        const termValues = [];
        terms.forEach((term, i) => {
            const num = i + 1;
            const termI = i + 4;
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
                   text.text,
                   mem.last_change_time,
                   tags,
                   ${sumPoints.join(' + ')} AS sumSim
            FROM mem
                     LEFT JOIN text USING(text_id)
                     JOIN mem_with_sim USING (mem_id)
            WHERE mem.account_id = $1
              AND ${termConditions.join(' AND ')}
            ORDER BY sumSim DESC
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
                     LEFT JOIN text USING (text_id)
                     LEFT JOIN mem_tag USING (mem_id)
                     LEFT JOIN tag USING (tag_id)
            WHERE mem.account_id = $1
            GROUP BY mem.mem_id, text.text, mem.last_change_time
            ORDER BY mem.last_change_time desc
            LIMIT $2 OFFSET $3
        `;
        values = [userId, limit, offset];
    }
    const res = await query(sql, values);
    return res.rows.map(item => ({
        id: item.mem_id,
        text: item.text,
        time: item.last_change_time,
        tags: item.tags[0] == null ? [] : item.tags,
    }));
}

module.exports = {
    listItems,
}
