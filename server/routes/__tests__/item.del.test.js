const request = require('supertest');
const app = require('../../app');

describe('item del', () => {
    const query = app._db.query;

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('success', async () => {
        query
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{
                    account_id: 1,
                    token: 'someToken'
                }],
            });

        await request(app)
            .post('/api/item/del')
            .set('Cookie', 'token=someToken')
            .send({
                itemId: 1,
            })
            .expect(200)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Item deleted');
            });
        expect(query.mock.calls.length).toBe(2);
    });

    test('fail without itemId', () => {
        query
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{
                    account_id: 1,
                    token: 'someToken'
                }],
            });

        return request(app)
            .post('/api/item/del')
            .set('Cookie', 'token=someToken')
            .expect(400)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Incorrect data');
            });
    });
});
