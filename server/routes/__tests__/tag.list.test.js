const request = require('supertest');
const app = require('../../app');

describe('tag list', () => {
    beforeEach(() => {
        return app._db.refreshDb();
    });

    test('success with text', async () => {
        await request(app)
            .post('/api/tag/list')
            .set('Cookie', 'token=someToken')
            .send({
                text: 'it',
            })
            .expect(200)
            .expect(({body}) => {
                expect(body).toHaveProperty('list', ['and it', 'it']);
            });
    });

    test('success with empty text', async () => {
        await request(app)
            .post('/api/tag/list')
            .set('Cookie', 'token=someToken')
            .send({
                text: '',
            })
            .expect(200)
            .expect(({body}) => {
                expect(body).toHaveProperty('list');
                expect(body.list.includes('something')).toBe(true);
            });
    });

    test('fail without data', () => {
        return request(app)
            .post('/api/tag/list')
            .set('Cookie', 'token=someToken')
            .expect(400)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Incorrect data');
            });
    });
});
