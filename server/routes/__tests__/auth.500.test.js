const request = require('supertest');
const app = require('../../app');

describe('internal exception', () => {
    test('success', async () => {
        app._db.switchToPgMock();
        app._db.query.mockRejectedValueOnce(new Error(`Oh, it's ok`));

        await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@test.com',
                password: '123456'
            })
            .expect(500)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Something went wrong, try again');
            });

        jest.clearAllMocks();
        app._db.switchToPgMem();
    });
});
