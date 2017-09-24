'use strict';
//Setting up dependencies
var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
//Requiring the Note and Article Models
var Note = require('./models/Note.js');
var Article = require('./models/Article.js');
//Setting up the scraping tools
var request = require('request');
var cheerio = require('cheerio');
//Set mongoose to work with ES6 Javascript Promises
mongoose.Promise = Promise;

//Initializing the express app
var app = express();

//Setting up morgan and body-parser for use
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: false
}));

//Configuring static public directory
app.use(express.static('public'));

//Mongoose configuration for database
mongoose.connect('mongodb://localhost/scraperdb');
var db = mongoose.connection;

//Display any mongoose errors
db.on('error', function(error) {
  console.log('Mongoose connection successful.');
});

//Configuring Routes
//=======================

//GET request to scrape data from the
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  request("http://www.usa.gov/features/", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // Now, we grab every h2 within an article tag, and do the following:
    $("pipe h1").each(function(i, element) {

      // Save an empty result object
      var result = {};

      $("a[href='http']").each(function() {
        $.this.prepend('<img src="https://www.google.com/s2/favicons?domain=' + this.ref + ' ">');
      });

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).children("a").text();
      result.summary = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");

      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)
      var entry = new Article(result);

      // Now, save that entry to the db
      entry.save(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        // Or log the doc
        else {
          console.log(doc);
        }
      });

    });
  });
  // Tell the browser that we finished scraping the text
  res.send("Scrape Complete");
});

// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {
  // Grab every doc in the Articles array
  Article.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});

// Grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ "_id": req.params.id })
  // ..and populate all of the notes associated with it
      .populate("note")
      // now, execute our query
      .exec(function(error, doc) {
        // Log any errors
        if (error) {
          console.log(error);
        }
        // Otherwise, send the doc to the browser as a json object
        else {
          res.json(doc);
        }
      });
});


// Create a new note or replace an existing note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  var newNote = new Note(req.body);

  // And save the new note the db
  newNote.save(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise
    else {
      // Use the article id to find and update it's note
      Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
      // Execute the above query
          .exec(function(err, doc) {
            // Log any errors
            if (err) {
              console.log(err);
            }
            else {
              // Or send the document to the browser
              res.send(doc);
            }
          });
    }
  });
});

// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});