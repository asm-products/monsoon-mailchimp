var bookshelf = require('../db');
var uuid = require('node-uuid');

var Activity = bookshelf.Model.extend({
  tableName: 'updates',

  initialize: function() {
    this.on('saving', this.setIdAndSentAt, this);
  },

  setId: function(model, attrs, options) {
    model.set({
      id: uuid.v4(),
      sent_at: Date.now()
    });
  }
});

module.exports = Activity;
