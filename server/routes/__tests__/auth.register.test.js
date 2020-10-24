const request = require('supertest');
const Cookies = require('expect-cookies');
const app = require('../../app');

describe('register', () => {
    beforeEach(() => {
        return app._db.refreshDb();
    });

    test('success', async () => {
        const query = app._db.query.bind(app._db);
        const sql = 'SELECT count(*) AS count FROM account';
        const accountsBefore = (await query(sql)).rows[0].count;
        await request(app)
            .post('/api/auth/register')
            .send({
                email: 'some@test.com',
                password: '123456'
            })
            .expect(201)
            .expect(Cookies.set({name: 'token', options: ['httponly', 'samesite']}))
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'User created');
                expect(body).toHaveProperty('userId', 2);
            });
        const accountsAfter = (await query(sql)).rows[0].count;
        expect(accountsAfter - accountsBefore).toBe(1);
    });

    test('fail on race', async () => {
        app._db.switchToPgMock();
        app._db.query
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{count: '0'}],
            })
            .mockRejectedValueOnce({
                constraint: 'account_email_key'
            });

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

        jest.clearAllMocks();
        app._db.switchToPgMem();
    });

    test('fail on exists email', () => {
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
