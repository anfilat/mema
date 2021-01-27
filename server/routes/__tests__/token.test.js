const request = require('supertest');
const app = require('../../app');

describe('auth middleware', () => {
    beforeEach(() => {
        return app._db.refreshDb();
    });

    test('fail without auth token', () => {
        return request(app)
            .post('/api/item/add')
            .send({
                text: 'Some text',
            })
            .expect(401)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Unauthorized');
            });
    });

    test('fail on wrong token', () => {
        return request(app)
            .post('/api/item/add')
            .set('Cookie', 'token=wrongToken')
            .send({
                text: 'Some text',
            })
            .expect(401)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Unauthorized');
            });
    });
});
