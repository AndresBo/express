// use this for trying and testing during development

const mongoose = require('mongoose')

if (process.argv.length<3) {
    console.log('give password as argument')
    process.exit(1)
}
// take password from third argument in command line
const password = process.argv[2]

const url = `mongodb+srv://andresb:${password}@cluster0.1isxvxb.mongodb.net/noteApp?retryWrites=true&w=majority`


mongoose.set('strictQuery',false)
mongoose.connect(url)
// define schema for a note 
const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
})
// Note model definition. Note first parameter 'note' is singular. The name of the collection will be 'notes'.
// Mongoose automatically names them plural when the schema refers to them in singular.
const Note = mongoose.model('Note', noteSchema)

// create a new note using Note model
const note = new Note({
  content: 'Mogoose is an Object Data Modeling (ODM)',
  important: true,
})

// // save and close to finish executing
// note.save().then(result => {
//   console.log('note saved!', result)
//   mongoose.connection.close()
// })

// to retrieve data, use 'find' method of the Note model:
Note.find({}).then(result => {
  result.forEach(note => {
    console.log(note)
  })
  mongoose.connection.close()
})
