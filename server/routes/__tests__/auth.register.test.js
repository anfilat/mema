const request = require('supertest');
const Cookies = require('expect-cookies');
const app = require('../../app');

describe('register', () => {
    const query = app._db.query;

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('success', () => {
        query.mockResolvedValueOnce({
            rowCount: 1,
            rows: [{count: '0'}],
        });
        query.mockResolvedValueOnce({
            rowCount: 1,
            rows: [{account_id: '1'}],
        });

        return request(app)
            .post('/api/auth/register')
            .send({
                email: 'test@test.com',
                password: '123456'
            })
            .expect(201)
            .expect(Cookies.set({name: 'token', options: ['httponly', 'samesite']}))
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'User created');
                expect(body).toHaveProperty('userId', 1);
            });
    });

    test('fail on race', () => {
        query.mockResolvedValueOnce({
            rowCount: 1,
            rows: [{count: '0'}],
        });
        query.mockRejectedValueOnce({
            constraint: 'account_email_key'
        });

        return request(app)
            .post('/api/auth/register')
            .send({
                email: 'test@test.com',
                password: '123456'
            })
            .expect(400)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'The user already exists');
            });
    });

    test('fail on exists email', () => {
        query.mockResolvedValueOnce({
            rowCount: 1,
            rows: [{count: '1'}],
        });

        return request(app)
            .post('/api/auth/register')
            .send({
                email: 'test@test.com',
                password: '123456'
            })
            .expect(400)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'The user already exists');
            });
    });

    test('fail on wrong email and password', () => {
        return request(app)
            .post('/api/auth/register')
            .send({
                email: 'wrong.mail.com',
                password: '123'
            })
            .expect(400)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Incorrect data');
            });
    });
});
