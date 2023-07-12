const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

// wrap app with supertest function. api object and tests can use it to make HTTP requests to backend
const api = supertest(app)

test('notes are returned as json', async () => {
  await api
    .get('/api/notes')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

afterAll(async () => {
  await mongoose.connection.close()
})
