var bookshelf = require('../db');
var uuid = require('node-uuid');

var Update = bookshelf.Model.extend({
  tableName: 'updates',

  defaults: function() {
    return {
      id: uuid.v4()
    };
  },

  initialize: function() {
    this.on('creating', this.setIdAndSentAt, this);
  },

  setId: function(model, attrs, options) {
    model.set({
      id: uuid.v4()
    });
  }
});

module.exports = Update;
