const request = require('supertest');
const app = require('../../app');

describe('item update', () => {
    beforeEach(() => {
        return app._db.refreshDb();
    });

    test('success', async () => {
        await request(app)
            .post('/api/item/update')
            .set('Cookie', 'token=someToken')
            .send({
                text: 'Other text',
                itemId: 1,
                textId: 1,
            })
            .expect(200)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Text saved');
            });
    });

    test('fail on outdated textId', async () => {
        await request(app)
            .post('/api/item/resave')
            .set('Cookie', 'token=someToken')
            .send({
                text: 'New text',
                itemId: 1,
            })
        await request(app)
            .post('/api/item/update')
            .set('Cookie', 'token=someToken')
            .send({
                text: 'Some text',
                itemId: 1,
                textId: 1,
            })
            .expect(400)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Outdated');
                expect(body).toHaveProperty('outdated', true);
            });
    });

    test('fail without data', async () => {
        await request(app)
            .post('/api/item/update')
            .set('Cookie', 'token=someToken')
            .expect(400)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Incorrect data');
            });
    });
});
