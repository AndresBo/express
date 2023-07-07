require('dotenv').config()

const express = require('express')
const app = express()

const cors = require('cors')

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


// let notes = [
//     {
//       id: 1,
//       content: "HTML is easy",
//       important: true
//     },
//     {
//       id: 2,
//       content: "Browser can execute only JavaScript",
//       important: false
//     },
//     {
//       id: 3,
//       content: "GET and POST are the most important methods of HTTP protocol",
//       important: true
//     }
// ]


// const generateId = () => {
//   const maxId = notes.length > 0 
//     ? Math.max(...notes.map(n => n.id))
//     : 0
//   return maxId + 1 
// }


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


// deleting a note that exists and one that does not exists, results in same response 204.
// any exceptions is passed to errorHandler
app.delete('/api/notes/:id', (request, response, next) => {
  Note.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})


app.post('/api/notes', (request, response, next) => {
  const body = request.body
  // use Note constructor function:
  const note = new Note ({
    content: body.content,
    important: body.important || false,
  })
  // save note and the savedNote is the newly created note
  note.save()
    .then(savedNote => {
      response.json(savedNote)
    })
    .catch(error => next(error))
})


// toggling importance of a note:
app.put('/api/notes/:id', (request, response, next) => {
  const { content, important } = request.body
  
  // findByIdAndUpdate gets the original document by default without modification.
  // The optional { new: true } parameter causes the event handler to be called with the 
  // new modified document and not the original.
  Note.findByIdAndUpdate(
    request.params.id, 
    { content, important }, 
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})


// express error handler that accepts four parameters:
// 'errorHandler' is a catch-all error handler function
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error:error.message })
  }
  next(error)
}

// this HAS to be the LAST loaded middleware
app.use(errorHandler)


const PORT = process.env.PORT 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
