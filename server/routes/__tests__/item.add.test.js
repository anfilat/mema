const request = require('supertest');
const app = require('../../app');

describe('item add', () => {
    beforeEach(() => {
        return app._db.refreshDb();
    });

    test('success', async () => {
        const itemId = 2;
        const textId = 1;

        app._db.switchToPgMock();
        app._db.query
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{
                    account_id: 1,
                    token: 'someToken'
                }],
            });
        app._db.query
            .mockResolvedValueOnce({
                rowCount: 0,
                rows: [],
            })
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{text_id: textId}],
            })
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{mem_id: itemId}],
            })
            .mockResolvedValueOnce({
                rowCount: 0,
                rows: [],
            });
        app._db.query
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{tag_id: 1}],
            })
            .mockResolvedValueOnce({
                rowCount: 0,
                rows: [],
            });
        app._db.query
            .mockResolvedValueOnce({
                rowCount: 0,
                rows: [],
            })
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{tag_id: 2}],
            })
            .mockResolvedValueOnce({
                rowCount: 0,
                rows: [],
            });

        await request(app)
            .post('/api/item/add')
            .set('Cookie', 'token=someToken')
            .send({
                text: 'Some text',
                tags: ['old tag', 'new tag'],
            })
            .expect(201)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Text saved');
                expect(body).toHaveProperty('itemId', itemId);
                expect(body).toHaveProperty('textId', textId);
            });

        jest.clearAllMocks();
        app._db.switchToPgMem();
    });

    test('success without tags', async () => {
        const itemId = 2;
        const textId = 1;

        app._db.switchToPgMock();
        app._db.query
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{
                    account_id: 1,
                    token: 'someToken'
                }],
            })
            .mockResolvedValueOnce({
                rowCount: 0,
                rows: [],
            })
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{text_id: textId}],
            })
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{mem_id: itemId}],
            });

        await request(app)
            .post('/api/item/add')
            .set('Cookie', 'token=someToken')
            .send({
                text: 'Some text',
            })
            .expect(201)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Text saved');
                expect(body).toHaveProperty('itemId', itemId);
                expect(body).toHaveProperty('textId', textId);
            });

        jest.clearAllMocks();
        app._db.switchToPgMem();
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
