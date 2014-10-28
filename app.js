var bodyParser = require('body-parser');
var dotenv = require('dotenv');
var express = require('express');
var fs = require('fs');
var path = require('path');

dotenv.load();

var app = express();
var controllers = require('./controllers');

// middleware

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// routes
app.use('/', controllers.subscribers);
app.use('/', controllers.activities);

app.set('started', Date.now());

app.get('/', function(req, res) {
  res.json({
    app: 'ASM MailChimp Adapter',
    version: '0.1.0',
    uptime: (Date.now() - app.get('started'))
  });
});

app.listen(process.env.PORT || 4000);
