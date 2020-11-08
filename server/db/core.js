const {Pool} = require('pg');

let pool = null;

function initDb() {
    pool = new Pool({
        connectionString: process.env.APP_PG_CONNECT,
    });

    pool.on('error', (err) => {
        console.error('Unexpected error on pg:', err);
        process.exit(1);
    });

    return pool;
}

function closeDb(cb) {
    pool.end(cb);
}

async function query(sql, values) {
    return pool.query(sql, values);
}

async function get(sql, values) {
    const res = await pool.query(sql, values);
    if (res.rowCount === 0) {
        return null;
    }
    return res.rows[0];
}

async function getValue(sql, values, name) {
    const res = await pool.query(sql, values);
    if (res.rowCount === 0) {
        return null;
    }
    return res.rows[0][name];
}

async function getValueArray(sql, values, name) {
    const res = await pool.query(sql, values);
    return res.rows.map(item => item[name]);
}

async function transaction(func) {
    const client = await pool.connect();

    let cancelled = false;
    async function cancel() {
        cancelled = true;
        return client.query('ROLLBACK');
    }

    try {
        await client.query('BEGIN');

        const result = await func(client, cancel);

        if (!cancelled) {
            await client.query('COMMIT');
        }
        return result;
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

async function getClient() {
    return pool.connect();
}

async function clientQuery(client, sql, values) {
    return client.query(sql, values);
}

async function clientGetValue(client, sql, values, name) {
    const res = await client.query(sql, values);
    if (res.rowCount === 0) {
        return null;
    }
    return res.rows[0][name];
}

async function clientGetValueArray(client, sql, values, name) {
    const res = await client.query(sql, values);
    return res.rows.map(item => item[name]);
}

module.exports = {
    initDb,
    closeDb,
    query,
    get,
    getValue,
    getValueArray,
    transaction,
    getClient,
    clientQuery,
    clientGetValue,
    clientGetValueArray,
};
