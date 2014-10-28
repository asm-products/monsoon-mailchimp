"use strict";

module.exports = {
  up: function(migration, dataTypes, done) {
    migration.createTable('updates', {
      id: {
        type: dataTypes.UUID,
        primaryKey: true,
        defaultValue: dataTypes.UUIDV4
      },
      created_at: dataTypes.DATE,
      updated_at: dataTypes.DATE,
      sent_at: dataTypes.DATE,
      checked_at: dataTypes.DATE,
      current_count: dataTypes.INTEGER,
      product: {
        type: dataTypes.STRING,
        unique: true
      }
    }).done(done);
  },

  down: function(migration, dataTypes, done) {
    migration.dropTable('updates').done(done);
  }
};
