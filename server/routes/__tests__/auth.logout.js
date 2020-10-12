const request = require('supertest');
const app = require('../../app');
const {newTokenPair} = require('../../utils/jwt');

describe('logout', () => {
    const query = app._db.query;
    const {authToken} = newTokenPair(1);
    const authHeader = `Bearer ${authToken}`;

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('success', async () => {
        await request(app)
            .post('/api/auth/logout')
            .set('Authorization', authHeader)
            .expect(200);
        expect(query.mock.calls.length).toBe(1);
    });
});
