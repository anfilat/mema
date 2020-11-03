const request = require('supertest');
const app = require('../../app');

describe('item get', () => {
    beforeEach(() => {
        return app._db.refreshDb();
    });

    test('success', async () => {
        await request(app)
            .post('/api/item/get')
            .set('Cookie', 'token=someToken')
            .send({
                itemId: 1,
            })
            .expect(200)
            .expect(({body}) => {
                expect(body).toHaveProperty('text', 'Some text');
                expect(body).toHaveProperty('textId', 1);
            });
    });

    test('fail without data', () => {
        return request(app)
            .post('/api/item/get')
            .set('Cookie', 'token=someToken')
            .expect(400)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Incorrect data');
            });
    });

    test('fail on missed itemId', async () => {
        await request(app)
            .post('/api/item/get')
            .set('Cookie', 'token=someToken')
            .send({
                itemId: 777,
            })
            .expect(400)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Item not found');
            });
    });
});
