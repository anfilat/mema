const request = require('supertest');
const app = require('../app');

test('get index.html', () => {
    return request(app)
        .get('/')
        .expect('Content-Type', /text\/html/)
        .expect(200)
        .expect(({text}) => expect(text.startsWith('<!doctype html>')).toBe(true));
});

test('get some page html', () => {
    return request(app)
        .get('/name')
        .expect('Content-Type', /text\/html/)
        .expect(200)
        .expect(({text}) => expect(text.startsWith('<!doctype html>')).toBe(true));
});

test('check health', () => {
    return request(app)
        .get('/api/health')
        .expect(200)
        .expect(({body}) => {
            expect(body).toHaveProperty('status', 'ok');
        });
});

test('api wrong endpoint', () => {
    return request(app)
        .get('/api/wrong')
        .expect(404);
});

test('api wrong verb', () => {
    return request(app)
        .get('/api/auth/login')
        .expect(404);
});
