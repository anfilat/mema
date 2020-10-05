const request = require('supertest');
const app = require('../../app');
const db = require('../../db');

const getAccountSQL = 'SELECT * FROM account WHERE email = $1';
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

test('login', async () => {
    const pool = db.initFakeDb();
    pool.add(getAccountSQL, ['string'], getAccountResult);

    await request(app)
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

test('login with wrong password', async () => {
    const pool = db.initFakeDb();
    pool.add(getAccountSQL, ['string'], getAccountResult);

    await request(app)
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

test('login as not registered user', async () => {
    const pool = db.initFakeDb();
    pool.add(getAccountSQL, ['string'], getAccountNotFoundResult);

    await request(app)
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

test('login without auth data', async () => {
    await request(app)
        .post('/api/auth/login')
        .expect(400)
        .expect(({body}) => {
            expect(body).toHaveProperty('message', 'Incorrect data');
        });
});
