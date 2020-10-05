const request = require('supertest');
const app = require('../../app');
const db = require('../../db');

const checkEmailSQL = 'SELECT Count(*) AS count FROM account WHERE email = $1';
const checkEmailResult = {
    rowCount: 1,
    rows: [{count: '1'}],
};
const checkEmailNotFoundResult = {
    rowCount: 1,
    rows: [{count: '0'}],
};

const addAccountSQL = 'INSERT INTO account (email, password) VALUES ($1, $2) RETURNING account_id';
const addAccountResult = {
    rowCount: 1,
    rows: [{account_id: '1'}],
};

test('register', async () => {
    const pool = db.initFakeDb();
    pool.add(checkEmailSQL, ['string'], checkEmailNotFoundResult);
    pool.add(addAccountSQL, ['string', 'string'], addAccountResult);

    await request(app)
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

test('register with exists email', async () => {
    const pool = db.initFakeDb();
    pool.add(checkEmailSQL, ['string'], checkEmailResult);

    await request(app)
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

test('register with wrong email and password', async () => {
    await request(app)
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
