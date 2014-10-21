var bookshelf = require('bookshelf');
var knex = require('knex');
var config = require('./config');

module.exports = bookshelf(knex(config.db, config.migrations));
