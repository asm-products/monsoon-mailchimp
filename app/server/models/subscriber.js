var bookshelf = require('../db');
var uuid = require('node-uuid');

var Subscriber = bookshelf.Model.extend({
  tableName: 'subscribers',
  hasTimestamps: true,

  initialize: function() {
    this.on('saving', this.setId, this);
  },

  setId: function(model, attrs, options) {
    model.set({ id: uuid.v4() });
  }
});

module.exports = Subscriber;
