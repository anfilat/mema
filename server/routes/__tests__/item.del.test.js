const request = require('supertest');
const app = require('../../app');

describe('item del', () => {
    beforeEach(() => {
        return app._db.refreshDb();
    });

    test('success', async () => {
        app._db.switchToPgMock();
        app._db.query
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

        jest.clearAllMocks();
        app._db.switchToPgMem();
    });

    test('fail without itemId', () => {
        return request(app)
            .post('/api/item/del')
            .set('Cookie', 'token=someToken')
            .expect(400)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Incorrect data');
            });
    });
});
