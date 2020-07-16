const config = require('config');
const {Pool} = require('pg');

let pool = null;

const initDb = async () => {
    pool = new Pool({
        connectionString: config.get('pgconnect'),
    });

    pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
        process.exit(1);
    });
};

async function getConnect() {
    return pool.connect();
}

async function get(sql, values) {
    const res = await pool.query(sql, values);
    if (res.rowCount === 0) {
        return null;
    }
    return res.rows[0];
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
    getConnect,
    get,
    transaction,
};
