const request = require('supertest');
const app = require('../../app');

test('internal exception', async () => {
    await request(app)
        .post('/api/auth/register')
        .send({
            email: 'test@test.com',
            password: '123456'
        })
        .expect(500)
        .expect(({body}) => {
            expect(body).toHaveProperty('message', 'Something went wrong, try again');
        });
});
