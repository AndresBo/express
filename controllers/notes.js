const notesRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Note = require('../models/note')
const User = require('../models/user')

const getTokenFrom = request => {
  const authorization = request.get('authorization')

  if (authorization && authorization.starstWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

notesRouter.get('/', async (request, response) => {
  const notes = await Note.find({}).populate('user', { username: 1, name: 1 })
  response.json(notes)
})
// promise alternative for GET:
// notesRouter.get('/', (request, response) => {
//   Note.find({}).then(notes => {
//     response.json(notes)
//   })
// })

// get individual note. now the error is passed forward with next function as a parameter.
// if next is called WITHOUT a parameter, it goes to the next middleware or route.
// if next is called WITH a parameter, the execution continues to the error handler middleware
notesRouter.get('/:id', async (request, response, next) => {
  try {
    const note = await Note.findById(request.params.id)
    if(note) {
      response.json(note)
    } else {
      response.status(404).end()
    }
  } catch(exception) {
    next(exception)
  }
})
// using promises alternative for get a note:
// notesRouter.get('/:id', (request, response, next) => {
//   Note.findById(request.params.id)
//     .then(note => {
//       if(note) {
//         response.json(note)
//       } else {
//         response.status(404).end()
//       }
//     })
//     .catch(error => next(error))
// })

notesRouter.delete('/:id', async (request, response, next) => {
  try {
    await Note.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } catch(exception) {
    next(exception)
  }
})
// using promises alternative for DELETE method
// notesRouter.delete('/:id', (request, response, next) => {
//   Note.findByIdAndRemove(request.params.id)
//     .then( () => {
//       response.status(204).end()
//     })
//     .catch(error => next(error))
// })

notesRouter.post('/', async (request, response, next) => {
  const body = request.body
  // getTokenFrom helper function gets token from authorization header
  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
  if(!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  // look up user
  const user = await User.findById(decodedToken.id)

  console.log('response body', request.body)
  // use Note constructor function:
  const note = new Note ({
    content: body.content,
    important: body.important || false,
    user: user.id
  })
  // save note and the savedNote is the newly created note
  // using promises (delete async):
  // note.save()
  //   .then(savedNote => {
  //     response.status(201).json(savedNote)
  //   })
  //   .catch(error => next(error))

  // using async/await
  try {
    const savedNote = await note.save()
    // note how user object also changed as we save the note id to the notes field
    user.notes = user.notes.concat(savedNote._id)
    await user.save()

    response.status(201).json(savedNote)

  } catch(exception) {
    next(exception)
  }
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
