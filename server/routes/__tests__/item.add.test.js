const request = require('supertest');
const app = require('../../app');

describe('item add', () => {
    const query = app._db.query;

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('success', async () => {
        const itemId = 2;
        const textId = 1;

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
                rows: [{mem_id: itemId}],
            });

        await request(app)
            .post('/api/item/add')
            .set('Cookie', 'token=someToken')
            .send({
                text: 'Some text',
            })
            .expect(201)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Text saved');
                expect(body).toHaveProperty('itemId', itemId);
                expect(body).toHaveProperty('textId', textId);
            });
        expect(query.mock.calls.length).toBe(4);
    });

    test('fail without text', () => {
        query
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{
                    account_id: 1,
                    token: 'someToken'
                }],
            })

        return request(app)
            .post('/api/item/add')
            .set('Cookie', 'token=someToken')
            .expect(400)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Empty text');
            });
    });

    test('fail on empty text', () => {
        query
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{
                    account_id: 1,
                    token: 'someToken'
                }],
            })

        return request(app)
            .post('/api/item/add')
            .set('Cookie', 'token=someToken')
            .send({
                text: '  ',
            })
            .expect(400)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Empty text');
            });
    });
});
