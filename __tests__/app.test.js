const request = require('supertest');
const app = require('../app');

test('index.html', async () => {
    await request(app)
        .get('/')
        .expect('Content-Type', /text\/html/)
        .expect(200);
});

test('some page', async () => {
    await request(app)
        .get('/name')
        .expect('Content-Type', /text\/html/)
        .expect(200);
});

test('/api/wrong', async () => {
    await request(app)
        .get('/api/wrong')
        .expect(404);
});
