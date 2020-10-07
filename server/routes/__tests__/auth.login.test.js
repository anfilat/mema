const request = require('supertest');
const app = require('../../app');

const getAccountResult = {
    rowCount: 1,
    rows: [{
        account_id: 1,
        email: 'test@test.com',
        password: '$2a$10$OMl9d4gvfzicPEhXQ3diru0xT6Rpp0EKvMNWnW32CQ/1kjLr0fAB2'
    }],
};
const getAccountNotFoundResult = {
    rowCount: 0,
    rows: [],
};

describe('login', () => {
    const query = app._db.query;

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('success', () => {
        query.mockResolvedValueOnce(getAccountResult);

        return request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@test.com',
                password: '123456'
            })
            .expect(200)
            .expect(({body}) => {
                expect(body).toHaveProperty('token');
                expect(body).toHaveProperty('userId', 1);
            });
    });

    test('with wrong password', () => {
        query.mockResolvedValueOnce(getAccountResult);

        return request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@test.com',
                password: '123'
            })
            .expect(400)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Invalid password, try again');
            });
    });

    test('as not registered user', () => {
        query.mockResolvedValueOnce(getAccountNotFoundResult);

        return request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@test.com',
                password: '123456'
            })
            .expect(400)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'The user is not found');
            });
    });

    test('without auth data', () => {
        return request(app)
            .post('/api/auth/login')
            .expect(400)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Incorrect data');
            });
    });
});
