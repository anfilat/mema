const request = require('supertest');
const app = require('../../app');
const {newTokenPair} = require('../../utils/jwt');

describe('item add', () => {
    const query = app._db.query;
    const {authToken} = newTokenPair(1);
    const authHeader = `Bearer ${authToken}`;

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('success', () => {
        query
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{text_id: 1}],
            })
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{mem_id: 1}],
            });

        return request(app)
            .post('/api/item/add')
            .set('Authorization', authHeader)
            .send({
                text: 'Some text',
            })
            .expect(201)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Text saved');
            });
    });

    test('fail without text', () => {
        return request(app)
            .post('/api/item/add')
            .set('Authorization', authHeader)
            .expect(400)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Empty text');
            });
    });

    test('fail on empty text', () => {
        return request(app)
            .post('/api/item/add')
            .set('Authorization', authHeader)
            .send({
                text: '  ',
            })
            .expect(400)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Empty text');
            });
    });
});
