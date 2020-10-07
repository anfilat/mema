const request = require('supertest');
const app = require('../../app');

describe('internal exception', () => {
    const query = app._db.query;

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('success', () => {
        query.mockRejectedValueOnce(new Error());

        return request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@test.com',
                password: '123456'
            })
            .expect(500)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Something went wrong, try again');
            });
    });
});
