const request = require('supertest');
const app = require('../../app');

describe('item resave', () => {
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
            });

        await request(app)
            .post('/api/item/resave')
            .set('Cookie', 'token=someToken')
            .send({
                text: 'Some text',
                itemId,
            })
            .expect(200)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Text saved');
                expect(body).toHaveProperty('itemId', itemId);
                expect(body).toHaveProperty('textId', textId);
            });
        expect(query.mock.calls.length).toBe(4);
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
            .post('/api/item/resave')
            .set('Cookie', 'token=someToken')
            .expect(400)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Incorrect data');
            });
    });
});
