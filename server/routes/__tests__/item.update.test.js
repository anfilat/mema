const request = require('supertest');
const app = require('../../app');
const {newTokenPair} = require('../../utils/jwt');

describe('item update', () => {
    const query = app._db.query;
    const {authToken} = newTokenPair(1);
    const authHeader = `Bearer ${authToken}`;

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('success', async () => {
        const itemId = 2;
        const textId = 1;

        query
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{text_id: textId}],
            });

        await request(app)
            .post('/api/item/update')
            .set('Authorization', authHeader)
            .send({
                text: 'Some text',
                itemId,
                textId,
            })
            .expect(200)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Text saved');
            });
        expect(query.mock.calls.length).toBe(3);
    });

    test('fail on outdated textId', async () => {
        const itemId = 2;
        const textId = 1;

        query
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{text_id: textId + 1}],
            });

        await request(app)
            .post('/api/item/update')
            .set('Authorization', authHeader)
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
        expect(query.mock.calls.length).toBe(1);
    });

    test('fail without data', () => {
        return request(app)
            .post('/api/item/update')
            .set('Authorization', authHeader)
            .expect(400)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Incorrect data');
            });
    });
});
