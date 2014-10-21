var bookshelf = require('../db');
var uuid = require('node-uuid');

var Activity = bookshelf.Model.extend({
  tableName: 'activities',
  hasTimestamps: true,

  initialize: function() {
    this.on('saving', this.setId, this);
  },

  setId: function(model, attrs, options) {
    model.set({ id: uuid.v4() });
  }
});

module.exports = Activity;
