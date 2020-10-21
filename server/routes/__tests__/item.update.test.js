const request = require('supertest');
const app = require('../../app');

describe('item update', () => {
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
                rowCount: 0,
                rows: [],
            })
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{text_id: textId}],
            });

        await request(app)
            .post('/api/item/update')
            .set('Cookie', 'token=someToken')
            .send({
                text: 'Some text',
                itemId,
                textId,
            })
            .expect(200)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Text saved');
            });
    });

    test('fail on outdated textId', async () => {
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
                rowCount: 0,
                rows: [],
            })
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{text_id: textId + 1}],
            });

        await request(app)
            .post('/api/item/update')
            .set('Cookie', 'token=someToken')
            .send({
                text: 'Some text',
                itemId,
                textId,
            })
            .expect(400)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Outdated');
                expect(body).toHaveProperty('outdated', true);
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
            .post('/api/item/update')
            .set('Cookie', 'token=someToken')
            .expect(400)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Incorrect data');
            });
    });
});
