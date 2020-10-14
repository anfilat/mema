const request = require('supertest');
const app = require('../../app');
const {newTokenPair} = require('../../utils/jwt');

describe('item resave', () => {
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
            .post('/api/item/resave')
            .set('Authorization', authHeader)
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
        expect(query.mock.calls.length).toBe(3);
    });

    test('fail without data', () => {
        return request(app)
            .post('/api/item/resave')
            .set('Authorization', authHeader)
            .expect(400)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Incorrect data');
            });
    });
});
