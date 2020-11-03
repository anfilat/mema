const request = require('supertest');
const app = require('../../app');

describe('search list', () => {
    beforeEach(() => {
        return app._db.refreshDb();
    });

    test('success', async () => {
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
                rowCount: 1,
                rows: [{
                    mem_id: 1,
                    text: 'text',
                    last_change_time: new Date(),
                    tags: [],
                }],
            });

        await request(app)
            .post('/api/search/list')
            .set('Cookie', 'token=someToken')
            .send({
                text: 'todo',
                limit: 10,
                offset: 0,
            })
            .expect(200)
            .expect(({body}) => {
                expect(body).toHaveProperty('list');
                expect(body.list.length).toBe(1);
            });

        jest.clearAllMocks();
        app._db.switchToPgMem();
    });

    test('success without text', async () => {
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
                rowCount: 1,
                rows: [{
                    mem_id: 1,
                    text: 'text',
                    last_change_time: new Date(),
                    tags: [],
                }],
            });

        await request(app)
            .post('/api/search/list')
            .set('Cookie', 'token=someToken')
            .send({
                text: '',
            })
            .expect(200)
            .expect(({body}) => {
                expect(body).toHaveProperty('list');
                expect(body.list.length).toBe(1);
            });

        jest.clearAllMocks();
        app._db.switchToPgMem();
    });

    test('fail without data', () => {
        return request(app)
            .post('/api/search/list')
            .set('Cookie', 'token=someToken')
            .expect(400)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Incorrect data');
            });
    });
});
