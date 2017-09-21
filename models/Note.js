//Requiring Mongoose
var mongoose = require('mongoose');
//Create a schema class
var Schema = mongoose.Schema;

//Create the Note Schema
var NoteSchema = new Schema({
  //Only a string
  title: {
    type: String
  },
  //Only a string
  body: {
    type: String
  }
});

//Creating the Note model with the NoteSchema
var Note = mongoose.model("Note", NoteSchema);

//Exporting the Note model
module.exports = Note;