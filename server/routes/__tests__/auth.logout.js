const request = require('supertest');
const app = require('../../app');

describe('logout', () => {
    const query = app._db.query;

    beforeEach(() => {
        return app._db.refreshDb();
    });

    test('success', async () => {
        const sql = 'SELECT count(*) AS count FROM token WHERE account_id = $1';
        const values = [1];
        const tokensBefore = (await query(sql, values)).rows[0].count;
        await request(app)
            .post('/api/auth/logout')
            .set('Cookie', 'token=someToken')
            .expect(200);
        const tokensAfter = (await query(sql, values)).rows[0].count;
        expect(tokensBefore - tokensAfter).toBe(1);
    });
});
