'use strict';

exports.up = function(knex, Promise) {
  Promise.all([
    knex.schema.createTable('activities', function(table) {
      table.uuid('id').primary();
      table.timestamps();
      table.string('product');
      table.string('webhook_id');
      table.string('type');
      table.string('list_id');
      table.string('email');
    })
  ]);
};

exports.down = function(knex, Promise) {
  Promise.all([
    knex.schema.dropTable('activities')
  ]);
};
