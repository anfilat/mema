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
                tags: [`and it`],
            })
            .expect(200)
            .expect(({body}) => {
                expect(body).toHaveProperty('list');
                expect(body.list).toIncludeSameMembers(['it\'s', 'it']);
            });
    });

    test('success with text without previous tags', async () => {
        await request(app)
            .post('/api/tag/list')
            .set('Cookie', 'token=someToken')
            .send({
                text: 'it',
            })
            .expect(200)
            .expect(({body}) => {
                expect(body).toHaveProperty('list');
                expect(body.list).toIncludeSameMembers(['and it', 'it\'s', 'it']);
            });
    });

    test('success with empty text', async () => {
        await request(app)
            .post('/api/tag/list')
            .set('Cookie', 'token=someToken')
            .send({
                text: '',
                tags: [`and it`],
            })
            .expect(200)
            .expect(({body}) => {
                expect(body).toHaveProperty('list');
                expect(body.list).toIncludeSameMembers(['something', 'other', 'it', 'it\'s', 'todo', 'перекат']);
            });
    });

    test('success with empty text without previous tags', async () => {
        await request(app)
            .post('/api/tag/list')
            .set('Cookie', 'token=someToken')
            .send({
                text: '',
            })
            .expect(200)
            .expect(({body}) => {
                expect(body).toHaveProperty('list');
                expect(body.list).toIncludeSameMembers(['something', 'other', 'it', 'and it', 'it\'s', 'todo', 'перекат']);
            });
    });

    test('fail without data', async () => {
        await request(app)
            .post('/api/tag/list')
            .set('Cookie', 'token=someToken')
            .expect(400)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Incorrect data');
            });
    });
});
