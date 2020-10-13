const request = require('supertest');
const app = require('../../app');
const {newTokenPair} = require('../../utils/jwt');

describe('auth middleware', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('fail without auth token', () => {
        return request(app)
            .post('/api/item/add')
            .send({
                text: 'Some text',
            })
            .expect(401)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Unauthorized');
            });
    });

    test('fail on wrong token', () => {
        return request(app)
            .post('/api/item/add')
            .set('Authorization', 'token')
            .send({
                text: 'Some text',
            })
            .expect(401)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Unauthorized');
            });
    });
});

describe('auth middleware with expired token', () => {
    beforeEach(() => {
        jest.useFakeTimers('modern');
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    test('fail on expired token', () => {
        const now = +new Date('2020-10-01');
        const shift = +process.env.APP_JWT_EXPIRES * 1000;
        jest.setSystemTime(now);
        const {authToken} = newTokenPair(1);
        const authHeader = `Bearer ${authToken}`;
        jest.setSystemTime(now + shift);

        return request(app)
            .post('/api/item/add')
            .set('Authorization', authHeader)
            .send({
                text: 'Some text',
            })
            .expect(401)
            .expect(({body}) => {
                expect(body).toHaveProperty('message', 'Unauthorized');
            });
    });
});
