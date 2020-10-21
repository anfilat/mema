const request = require('supertest');
const app = require('../../app');

describe('item get', () => {
    const query = app._db.query;

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('success', async () => {
        const itemId = 2;
        const textId = 1;
        const text = 'Item text';

        query
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{
                    account_id: 1,
                    token: 'someToken'
                }],
            })
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{text_id: textId}],
            })
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{text}],
            });

        await request(app)
            .post('/api/item/get')
            .set('Cookie', 'token=someToken')
            .send({
                itemId,
            })
            .expect(200)
            .expect(({body}) => {
                expect(body).toHaveProperty('text', text);
                expect(body).toHaveProperty('textId', textId);
            });
    });

    test('fail without data', () => {
        query
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{
                    account_id: 1,
                    token: 'someToken'
                }],
            });

        return request(app)
            .post('/api/item/get')
            .set('Cookie', 'token=someToken')
            .expect(400)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Incorrect data');
            });
    });

    test('fail on missed itemId', async () => {
        const itemId = 2;

        query
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{
                    account_id: 1,
                    token: 'someToken'
                }],
            })
            .mockResolvedValueOnce({
                rowCount: 0,
                rows: [],
            });

        await request(app)
            .post('/api/item/get')
            .set('Cookie', 'token=someToken')
            .send({
                itemId,
            })
            .expect(400)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Item not found');
            });
    });
});
