const config = require('config')
const {Pool} = require('pg');

const pool = new Pool({
    connectionString: config.get('pgconnect'),
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(1);
});

const initDb = async () => {
    try {
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
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

initDb();

async function addUser(email, password) {
    const sql = 'INSERT INTO "user" (email, password) VALUES ($1, $2)';
    const values = [email, password];
    return pool.query(sql, values);
}

async function getUser(email) {
    const sql = 'SELECT * FROM "user" WHERE email = $1';
    const values = [email];
    const res = await pool.query(sql, values);
    if (res.rowCount === 0) {
        return null;
    }
    return res.rows[0];
}

module.exports = {
    addUser,
    getUser,
};
