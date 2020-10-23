const request = require('supertest');
const app = require('../../app');

describe('tag list', () => {
    const query = app._db.query;

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('success with text', async () => {
        query
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{
                    account_id: 1,
                    token: 'someToken'
                }],
            })
            .mockResolvedValueOnce({
                rowCount: 3,
                rows: [{tag: 'items'}, {tag: 'pitch'}, {tag: `it's`}],
            });

        await request(app)
            .post('/api/tag/list')
            .set('Cookie', 'token=someToken')
            .send({
                text: 'it',
            })
            .expect(200)
            .expect(({body}) => {
                expect(body).toHaveProperty('list', ['items', 'pitch', `it's`]);
            });
    });

    test('success with empty text', async () => {
        query
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{
                    account_id: 1,
                    token: 'someToken'
                }],
            })
            .mockResolvedValueOnce({
                rowCount: 3,
                rows: [{tag: 'items'}, {tag: 'pitch'}, {tag: `it's`}],
            });

        await request(app)
            .post('/api/tag/list')
            .set('Cookie', 'token=someToken')
            .send({
                text: '',
            })
            .expect(200)
            .expect(({body}) => {
                expect(body).toHaveProperty('list', ['items', 'pitch', `it's`]);
            });
    });

    test('fail without data', () => {
        query
            .mockResolvedValueOnce({
                rowCount: 1,
                rows: [{
                    account_id: 1,
                    token: 'someToken'
                }],
            });

        return request(app)
            .post('/api/tag/list')
            .set('Cookie', 'token=someToken')
            .expect(400)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Incorrect data');
            });
    });
});
