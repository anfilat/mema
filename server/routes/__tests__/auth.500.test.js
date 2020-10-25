const request = require('supertest');
const app = require('../../app');

describe('internal exception', () => {
    test('success', async () => {
        await request(app)
            .post('/api/crash')
            .expect(500)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Something went wrong, try again');
            });
    });
});
