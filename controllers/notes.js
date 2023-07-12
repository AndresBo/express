const notesRouter = require('express').Router()
const Note = require('../models/note')


notesRouter.get('/', async (request, response) => {
  const notes = await Note.find({})
  response.json(notes)
})
// promise alternative:
// notesRouter.get('/', (request, response) => {
//   Note.find({}).then(notes => {
//     response.json(notes)
//   })
// })

// get individual note. now the error is passed forward with next function as a parameter.
// if next is called WITHOUT a parameter, it goes to the next middleware or route.
// if next is called WITH a parameter, the execution continues to the error handler middleware
notesRouter.get('/:id', (request, response, next) => {
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

notesRouter.delete('/:id', (request, response, next) => {
  Note.findByIdAndRemove(request.params.id)
    .then( () => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

notesRouter.post('/', (request, response, next) => {
  const body = request.body
  // use Note constructor function:
  const note = new Note ({
    content: body.content,
    important: body.important || false,
  })
  // save note and the savedNote is the newly created note
  note.save()
    .then(savedNote => {
      response.status(201).json(savedNote)
    })
    .catch(error => next(error))
})

notesRouter.put('/:id', (request, response, next) => {
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


module.exports = notesRouter
