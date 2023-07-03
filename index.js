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

app.use(cors())
app.use(express.json())
app.use(express.static('build'))
app.use(requestLogger)


// mongoose config:
// const password = process.argv[2]
// const url = `mongodb+srv://andresb:${password}@cluster0.1isxvxb.mongodb.net/noteApp?retryWrites=true&w=majority`

// mongoose.set('strictQuery', false)
// mongoose.connect(url)

// const noteSchema = new mongoose.Schema({
//   content: String,
//   important: Boolean,
// })
// // transform _id to a string and deletes _id and _v mongo versioning field
// noteSchema.set('toJSON', {
//   transform: (document, returnedObject) => {
//     returnedObject.id = returnedObject._id.toString()
//     delete returnedObject._id
//     delete returnedObject.__v
//   }
// })

//const Note = mongoose.model('Note', noteSchema)


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

// get individual note
app.get('/api/notes/:id', (request, response) => {
  Note.findById(request.params.id).then(note => {
    response.json(note)
  })
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


const PORT = process.env.PORT 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
