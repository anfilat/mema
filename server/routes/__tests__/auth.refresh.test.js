const request = require('supertest');
const app = require('../../app');
const {newTokenPair} = require('../../utils/jwt');

describe('refresh', () => {
    const query = app._db.query;
    const {refreshToken} = newTokenPair(1);

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('success', async () => {
        query.mockResolvedValueOnce({
            rowCount: 1,
            rows: [{
                account_id: 1,
                token: 'f3298cf7-c6c9-498b-bbc4-b503cab23b97',
            }],
        });

        await request(app)
            .post('/api/auth/refresh')
            .send({
                refreshToken
            })
            .expect(200)
            .expect(({body}) => {
                expect(body).toHaveProperty('authToken');
                expect(body).toHaveProperty('refreshToken');
                expect(body).toHaveProperty('userId', 1);
            });
        expect(query.mock.calls.length).toBe(3);
    });

    test('fail on invalid refresh token', async () => {
        query.mockResolvedValueOnce({
            rowCount: 0,
            rows: [],
        });

        await request(app)
            .post('/api/auth/refresh')
            .send({
                refreshToken
            })
            .expect(403);
        expect(query.mock.calls.length).toBe(1);
    });
});
