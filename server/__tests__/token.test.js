const app = require('../app');
const db = require('../db');

test('tokens cleaning', async () => {
    const query = app._db.query;
    await app._db.refreshDb();

    const userId = 1;
    const oldTokens = await tokensCount();

    await db.addToken(userId, 'token1', new Date());
    await db.addToken(userId, 'token2', new Date());
    expect(await tokensCount()).toBe(oldTokens + 2);

    await db.deleteOldTokens();
    expect(await tokensCount()).toBe(oldTokens);

    async function tokensCount() {
        const sql = 'SELECT count(*) AS count FROM token WHERE account_id = $1';
        const values = [userId];
        return (await query(sql, values)).rows[0].count;
    }
});
