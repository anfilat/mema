const request = require('supertest');
const app = require('../../app');

describe('item resave', () => {
    beforeEach(() => {
        return app._db.refreshDb();
    });

    test('success', async () => {
        await request(app)
            .post('/api/item/resave')
            .set('Cookie', 'token=someToken')
            .send({
                text: 'Some text',
                itemId: 1,
            })
            .expect(200)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Text saved');
                expect(body).toHaveProperty('itemId', 1);
                expect(body).toHaveProperty('textId', 2);
            });
    });

    test('fail without data', () => {
        return request(app)
            .post('/api/item/resave')
            .set('Cookie', 'token=someToken')
            .expect(400)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Incorrect data');
            });
    });
});
