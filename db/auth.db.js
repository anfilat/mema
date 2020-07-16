const {transaction, get} = require('./core');

async function addUser(email, hashedPassword) {
    return transaction(async (client) => {
        const checkUserSQL = 'SELECT Count(*) AS count FROM "user" WHERE email = $1';
        const res = await client.query(checkUserSQL, [email]);
        if (res.rows[0].count != 0) {
            return false;
        }

        const addUserSQL = 'INSERT INTO "user" (email, password) VALUES ($1, $2)';
        await client.query(addUserSQL, [email, hashedPassword]);
        return true;
    });
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
