const request = require('supertest');
const app = require('../../app');

describe('item update', () => {
    beforeEach(() => {
        return app._db.refreshDb();
    });

    test('success', async () => {
        const query = app._db.query.bind(app._db);
        const sqlNewTag = `SELECT tag_id FROM tag WHERE account_id = 1 AND tag = 'new tag'`;
        expect((await query(sqlNewTag)).rowCount).toBe(0);

        await request(app)
            .post('/api/item/update')
            .set('Cookie', 'token=someToken')
            .send({
                text: 'Other text',
                tags: ['something', 'new tag'],
                itemId: 1,
                textId: 1,
            })
            .expect(200)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Text saved');
            });

        expect((await query(sqlNewTag)).rowCount).toBe(1);
        const sqlMemTags = `SELECT Count(tag_id) AS count FROM mem_tag WHERE mem_id = 1`;
        expect((await query(sqlMemTags)).rows[0].count).toBe(2);
    });

    test('success with same tags', async () => {
        const query = app._db.query.bind(app._db);

        await request(app)
            .post('/api/item/update')
            .set('Cookie', 'token=someToken')
            .send({
                text: 'Other text',
                tags: ['something', 'other'],
                itemId: 1,
                textId: 1,
            })
            .expect(200)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Text saved');
            });

        const sqlMemTags = `SELECT Count(tag_id) AS count FROM mem_tag WHERE mem_id = 1`;
        expect((await query(sqlMemTags)).rows[0].count).toBe(2);
    });

    test('success without tags', async () => {
        const query = app._db.query.bind(app._db);

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

        const sqlMemTags = `SELECT tag_id FROM mem_tag WHERE mem_id = 1`;
        expect((await query(sqlMemTags)).rowCount).toBe(0);
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
