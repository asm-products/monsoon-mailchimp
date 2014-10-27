var bodyParser = require('body-parser');
var dotenv = require('dotenv');
var express = require('express');
var fs = require('fs');
var path = require('path');

dotenv.load();

var app = express();

var controllers = require('./controllers');
var db = require('./db');

app.set('bookshelf', db);''

// middleware

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// routes
app.use('/', controllers.subscribers);
app.use('/', controllers.activities);

app.listen(process.env.PORT || 4000);
