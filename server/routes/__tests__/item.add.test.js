const request = require('supertest');
const app = require('../../app');

describe('item add', () => {
    beforeEach(() => {
        return app._db.refreshDb();
    });

    test('success', async () => {
        const query = app._db.query.bind(app._db);
        const sqlNewTag = `SELECT tag_id FROM tag WHERE account_id = 1 AND tag = 'new tag'`;
        expect((await query(sqlNewTag)).rowCount).toBe(0);

        await request(app)
            .post('/api/item/add')
            .set('Cookie', 'token=someToken')
            .send({
                text: 'Some text',
                tags: ['something', 'new tag'],
            })
            .expect(201)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Text saved');
                expect(body).toHaveProperty('itemId', 2);
                expect(body).toHaveProperty('textId', 2);
            });

        expect((await query(sqlNewTag)).rowCount).toBe(1);
        const sqlMemTags = `SELECT Count(tag_id) AS count FROM mem_tag WHERE mem_id = 2`;
        expect((await query(sqlMemTags)).rows[0].count).toBe(2);
    });

    test('success without tags', async () => {
        await request(app)
            .post('/api/item/add')
            .set('Cookie', 'token=someToken')
            .send({
                text: 'Some text',
            })
            .expect(201)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Text saved');
                expect(body).toHaveProperty('itemId', 2);
                expect(body).toHaveProperty('textId', 2);
            });
    });

    test('fail without text', () => {
        return request(app)
            .post('/api/item/add')
            .set('Cookie', 'token=someToken')
            .expect(400)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Empty text');
            });
    });

    test('fail on empty text', () => {
        return request(app)
            .post('/api/item/add')
            .set('Cookie', 'token=someToken')
            .send({
                text: '  ',
            })
            .expect(400)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Empty text');
            });
    });
});
