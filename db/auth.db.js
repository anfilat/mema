const {getConnect, get} = require('./core');

async function addUser(email, hashedPassword) {
    const client = await getConnect();
    try {
        await client.query('BEGIN');

        const checkUserSQL = 'SELECT Count(*) AS count FROM "user" WHERE email = $1';
        const res = await client.query(checkUserSQL, [email]);
        if (res.rows[0].count != 0) {
            await client.query('ROLLBACK');
            return false;
        }

        const addUserSQL = 'INSERT INTO "user" (email, password) VALUES ($1, $2)';
        await client.query(addUserSQL, [email, hashedPassword]);

        await client.query('COMMIT');
        return true;
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

async function getUser(email) {
    const sql = 'SELECT * FROM "user" WHERE email = $1';
    const values = [email];
    return get(sql, values);
}

module.exports = {
    addUser,
    getUser,
};
