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

    const client = await pool.connect();
    try {
        await client.query(`CREATE TABLE IF NOT EXISTS "user" (
            user_id serial PRIMARY KEY,
            email VARCHAR(64),
            password VARCHAR(64)
        )`);
    } finally {
        client.release();
    }
};

async function get(sql, values) {
    const res = await pool.query(sql, values);
    if (res.rowCount === 0) {
        return null;
    }
    return res.rows[0];
}

module.exports = {
    initDb,
    pool,
    get,
};
