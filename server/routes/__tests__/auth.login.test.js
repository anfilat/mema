const request = require('supertest');
const Cookies = require('expect-cookies');
const app = require('../../app');

describe('login', () => {
    beforeEach(() => {
        return app._db.refreshDb();
    });

    test('success', async () => {
        const query = app._db.query.bind(app._db);
        const sql = 'SELECT count(*) AS count FROM token WHERE account_id = 1';
        const tokensBefore = (await query(sql)).rows[0].count;
        await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@test.com',
                password: '123456'
            })
            .expect(200)
            .expect(Cookies.set({name: 'token', options: ['httponly', 'samesite']}))
            .expect(({body}) => {
                expect(body).toHaveProperty('userId', 1);
            });
        const tokensAfter = (await query(sql)).rows[0].count;
        expect(tokensAfter - tokensBefore).toBe(1);
    });

    test('fail on wrong password', () => {
        return request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@test.com',
                password: '123'
            })
            .expect(403)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Invalid password, try again');
            });
    });

    test('fail as not registered user', () => {
        return request(app)
            .post('/api/auth/login')
            .send({
                email: 'some@test.com',
                password: '123456'
            })
            .expect(403)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'The user is not found');
            });
    });

    test('fail without auth data', () => {
        return request(app)
            .post('/api/auth/login')
            .expect(400)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Incorrect data');
            });
    });
});
