const request = require('supertest');
const app = require('../../app');

describe('logout', () => {
    beforeEach(() => {
        return app._db.refreshDb();
    });

    test('success', async () => {
        const query = app._db.query.bind(app._db);
        const sql = 'SELECT * FROM token WHERE account_id = 1';
        const tokensBefore = (await query(sql)).rowCount;
        await request(app)
            .post('/api/auth/logout')
            .set('Cookie', 'token=someToken')
            .expect(200);
        const tokensAfter = (await query(sql)).rowCount;
        expect(tokensBefore - tokensAfter).toBe(1);
    });
});
