const request = require('supertest');
const app = require('../app');

test('get index.html', async () => {
    await request(app)
        .get('/')
        .expect('Content-Type', /text\/html/)
        .expect(200)
        .expect(({text}) => expect(text).toMatchSnapshot());
});

test('get some page html', async () => {
    await request(app)
        .get('/name')
        .expect('Content-Type', /text\/html/)
        .expect(200)
        .expect(({text}) => expect(text).toMatchSnapshot());
});

test('api wrong endpoint', async () => {
    await request(app)
        .get('/api/wrong')
        .expect(404);
});

test('api wrong verb', async () => {
    await request(app)
        .get('/api/auth/login')
        .expect(404);
});
