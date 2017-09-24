//Require mongoose
var mongoose = require('mongoose');
//Create Schema class
var Schema = mongoose.Schema;

//Creating article schema
var ArticleSchema = new Schema({
  //the headline string is required
  headline: {
    type: String,
    required: true
  },
  //the Summary string is required
  summary: {
    type: String,
    required: true
  },
  //the Link string is required
  link: {
    type: String,
    required: true
  },
  //Saving the note's ObjectId.  The ref refers to the Note model
  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});

//Creating the Article model with the ArticleSchema
var Article = mongoose.model('Article', ArticleSchema);

//Exporting the model
module.exports = Article;