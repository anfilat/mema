const request = require('supertest');
const app = require('../../app');

describe('logout', () => {
    const query = app._db.query;

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('success', async () => {
        query.mockResolvedValueOnce({
            rowCount: 1,
            rows: [{
                account_id: 1,
                token: 'someToken'
            }],
        });

        await request(app)
            .post('/api/auth/logout')
            .set('Cookie', 'token=someToken')
            .expect(200);
        expect(query.mock.calls.length).toBe(2);
    });
});
