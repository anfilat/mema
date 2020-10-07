const request = require('supertest');
const app = require('../../app');

const checkEmailResult = {
    rowCount: 1,
    rows: [{count: '1'}],
};
const checkEmailNotFoundResult = {
    rowCount: 1,
    rows: [{count: '0'}],
};
const addAccountResult = {
    rowCount: 1,
    rows: [{account_id: '1'}],
};

describe('register', () => {
    const query = app._db.query;

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('success', () => {
        query.mockResolvedValueOnce(checkEmailNotFoundResult);
        query.mockResolvedValueOnce(addAccountResult);

        return request(app)
            .post('/api/auth/register')
            .send({
                email: 'test@test.com',
                password: '123456'
            })
            .expect(201)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'User created');
                expect(body).toHaveProperty('token');
                expect(body).toHaveProperty('userId', 1);
            });
    });

    test('with race', () => {
        query.mockResolvedValueOnce(checkEmailNotFoundResult);
        query.mockRejectedValueOnce({constraint: 'account_email_key'});

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

    test('with exists email', () => {
        query.mockResolvedValueOnce(checkEmailResult);

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

    test('with wrong email and password', () => {
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
