const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')

// wrap app with supertest function. api object and tests can use it to make HTTP requests to backend
const api = supertest(app)
const Note = require('../models/note')

// clear out database, and then save the two notes in initialNotes to test database (!not production db)
beforeEach(async () => {
  await Note.deleteMany({})

  // save one by one:
  // let noteObject = new Note(helper.initialNotes[0])
  // await noteObject.save()

  // // or with a Promise.all:
  // // noteObjects is an array of mongoose objects created with Note constructor
  // const noteObjects = helper.initialNotes.map(note => new Note(note))
  // // promiseArray is an array of promises for saving each item to database
  // const promiseArray = noteObjects.map(note => note.save())
  // // Promise.all transforms array of promises into a single promise that is only fullfilled once every promise
  // // in array passed to it is resolved.
  // await Promise.all(promiseArray)

  // another option using a for of loop:
  for (let note of helper.initialNotes) {
    let noteObject = new Note(note)
    await noteObject.save()
  }

})


test('notes are returned as json', async () => {
  await api
    .get('/api/notes')
    .expect(200)
    .expect('Content-Type', /application\/json/)
}, 10000)

test('all notes are returned', async () => {
  const response = await api.get('/api/notes')

  expect(response.body).toHaveLength(helper.initialNotes.length)
})

test('a specific note is within the returned notes', async () => {
  const response = await api.get('/api/notes')

  const contents = response.body.map(r => r.content)
  expect(contents).toContain(
    'Browser can execute only JavaScript'
  )
})

test('a valid note can be added', async () => {
  const newNote = {
    content: 'async/await simplifies making async calls',
    important: true,
  }

  await api
    .post('/api/notes')
    .send(newNote)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const notesAtEnd = await helper.notesInDb()
  expect(notesAtEnd).toHaveLength(helper.initialNotes.length + 1)

  const contents = notesAtEnd.map(n => n.content)
  expect(contents).toContain('async/await simplifies making async calls')
})

test('a note without content is not added', async () => {
  const newNote = {
    important: true
  }

  await api
    .post('/api/notes')
    .send(newNote)
    .expect(400)

  const notesAtEnd = await helper.notesInDb()

  expect(notesAtEnd).toHaveLength(helper.initialNotes.length)
})

test('a specific note can be viewed', async () => {
  const notesAtStart = await helper.notesInDb()

  const noteToView = notesAtStart[0]

  const resultNote = await api
    .get(`/api/notes/${noteToView.id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  expect(resultNote.body).toEqual(noteToView)
})

test('a note can be deleted', async () => {
  const notesAtStart = await helper.notesInDb()
  const noteToDelete = notesAtStart[0]

  await api
    .delete(`/api/notes/${noteToDelete.id}`)
    .expect(204)

  const notesAtEnd = await helper.notesInDb()

  expect(notesAtEnd).toHaveLength(
    helper.initialNotes.length - 1
  )

  const contents = notesAtEnd.map(r => r.content)

  expect(contents).not.toContain(noteToDelete.content)

})


afterAll(async () => {
  await mongoose.connection.close()
})
