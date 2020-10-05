const request = require('supertest');
const app = require('../../app');

test('login as not registers user', async () => {
    await request(app)
        .post('/api/auth/login')
        .send({
            email: 'wrong.mail.com',
            password: '123'
        })
        .expect(400)
        .expect(({body}) => {
            expect(body).toEqual({ message: "The user is not found" });
        });
});

test('register with wrong email and password', async () => {
    await request(app)
        .post('/api/auth/register')
        .send({
            email: 'wrong.mail.com',
            password: '123'
        })
        .expect(400)
        .expect(({body}) => {
            expect(body.message).toEqual("Incorrect data");
        });
});
