const request = require('supertest');
const app = require('../../app');
const {newTokenPair} = require('../../utils/jwt');

describe('item del', () => {
    const query = app._db.query;
    const {authToken} = newTokenPair(1);
    const authHeader = `Bearer ${authToken}`;

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('success', async () => {
        await request(app)
            .post('/api/item/del')
            .set('Authorization', authHeader)
            .send({
                itemId: 1,
            })
            .expect(200)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Item deleted');
            });
        expect(query.mock.calls.length).toBe(1);
    });

    test('fail without itemId', () => {
        return request(app)
            .post('/api/item/del')
            .set('Authorization', authHeader)
            .expect(400)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Incorrect data');
            });
    });
});
