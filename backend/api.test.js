const request = require('supertest');
const app = require('./server');

describe('API Health and Auth Check', () => {
    it('Should return 401 when accessing tasks without auth', async () => {
        const res = await request(app).get('/api/tasks');
        expect(res.statusCode).toEqual(401);
    });
});
