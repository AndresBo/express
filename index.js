require('dotenv').config()

const express = require('express')
const app = express()

const cors = require('cors')

const mongoose = require('mongoose')

const Note = require('./models/note')

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}
// remember ORDER matters for middleware functions as execution is the same order as the loading
app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(requestLogger)


let notes = [
    {
      id: 1,
      content: "HTML is easy",
      important: true
    },
    {
      id: 2,
      content: "Browser can execute only JavaScript",
      important: false
    },
    {
      id: 3,
      content: "GET and POST are the most important methods of HTTP protocol",
      important: true
    }
]


const generateId = () => {
  const maxId = notes.length > 0 
    ? Math.max(...notes.map(n => n.id))
    : 0
  return maxId + 1 
}

// hello message
app.get('/', (request, response) => {
  response.send('<h1>Hello from express note backend</h1>')
})

// get all notes from db
app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
})

// get individual note. now the error is passed forward with next function as a parameter.
// if next is called WITHOUT a parameter, it goes to the next middleware or route.
// if next is called WITH a parameter, the execution continues to the error handler middleware
app.get('/api/notes/:id', (request, response, next) => {
  Note.findById(request.params.id)
    .then(note => {
      if(note) {
        response.json(note)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})


app.delete('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  notes = notes.filter(note => note.id !== id)

  response.status(204).end()
})


app.post('/api/notes', (request, response) => {
  const body = request.body

  if (body.content === undefined) {
    return response.status(400).json({error: 'content missing'})
  }
  // use Note constructor function:
  const note = new Note ({
    content: body.content,
    important: body.important || false,
  })
  // save note and the savedNote is the newly created note
  note.save().then(savedNote => {
    response.json(savedNote)
  })
})

// express error handler that accepts four parameters:
// 'errorHandler' is a catch-all error handler function
 const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError'){
    return response.status(400).send({ error: 'malformatted id' })
  }
  next(error)
}

// THIS has to be the LAST loaded middleware
app.use(errorHandler)


const PORT = process.env.PORT 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
