const request = require('supertest');
const app = require('../../app');

describe('auth middleware', () => {
    const query = app._db.query;

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('fail without auth token', () => {
        return request(app)
            .post('/api/item/add')
            .send({
                text: 'Some text',
            })
            .expect(401)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Unauthorized');
            });
    });

    test('fail on wrong token', () => {
        query
            .mockResolvedValueOnce({
                rowCount: 0,
                rows: [],
            })

        return request(app)
            .post('/api/item/add')
            .set('Cookie', 'token=someToken')
            .send({
                text: 'Some text',
            })
            .expect(401)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Unauthorized');
            });
    });
});
