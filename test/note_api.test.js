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

test('there are two notes', async () => {
  const response = await api.get('/api/notes')

  expect(response.body).toHaveLength(2)
})

test('the first note is about mongoose', async () => {
  const response = await api.get('/api/notes')

  expect(response.body[0].content).toBe('Mogoose is an Object Data Modeling (ODM)')
})

afterAll(async () => {
  await mongoose.connection.close()
})
