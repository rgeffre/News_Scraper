'use strict';
//Setting up dependencies
var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgon');
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
mongoose.connect('mongodb://localhost/')
var db = mongoose.connection;

//Display any mongoose errors
db.on('error', function(error) {
  console.log('Mongoose connection successful.');
});

//Configuring Routes
//=======================

//GET request to scrape data from the
