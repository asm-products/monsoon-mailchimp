'use strict';

exports.up = function(knex, Promise) {
  Promise.all([
    knex.schema.createTable('updates', function(table) {
      table.uuid('id').primary();
      table.dateTime('sent_at');
      table.dateTime('checked_at');
      table.integer('current_count');
      table.string('product').unique();
    })
  ]);
};

exports.down = function(knex, Promise) {
  Promise.all([
    knex.schema.dropTable('updates')
  ]);
};
