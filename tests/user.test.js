//we want to get access to our express application but we dont want listen to be called.
//we just want our express application before listen is called because the express application is defined inside the index.js above the listen call.
const request=require('supertest')
const app=require('../src/app')

test('Should signup a new user', async () => {
    await request(app).post('/users').send({
        name: 'Dipti',
        email: 'dipti@example.com',
        password: 'MyPass777!'
    }).expect(201)
})
