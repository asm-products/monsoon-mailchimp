"use strict";

module.exports = {
  up: function(migration, dataTypes, done) {
    migration.createTable('activities', {
      id: {
        type: dataTypes.UUID,
        primaryKey: true,
        defaultValue: dataTypes.UUIDV4
      },
      product: dataTypes.STRING,
      webhook_id: dataTypes.STRING,
      type: dataTypes.STRING,
      list_id: dataTypes.STRING,
      email: dataTypes.STRING,
      created_at: dataTypes.DATE,
      updated_at: dataTypes.DATE
    }).done(done);
  },

  down: function(migration, dataTypes, done) {
    migration.dropTable('activities').done(done);
  }
};
