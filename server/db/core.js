const config = require('config');
const {Pool} = require('pg');
const PgMock2 = require('pgmock2').default;
const {getPool} = require('pgmock2');

let pool = null;

function initDb() {
    pool = new Pool({
        connectionString: config.get('pgconnect'),
    });

    pool.on('error', (err) => {
        console.error('Unexpected error on pg:', err);
        process.exit(1);
    });
}

function initFakeDb() {
    const pg = new PgMock2();
    pool = getPool(pg);

    return pool;
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

module.exports = {
    initDb,
    initFakeDb,
    query,
    get,
    getValue,
    transaction,
};
