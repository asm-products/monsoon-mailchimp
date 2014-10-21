'use-strict';

exports.up = function(knex, Promise) {
  Promise.all([
    knex.schema.createTable('subscribers', function(table) {
      table.uuid('id').primary();
      table.timestamps();
      table.dateTime('deleted_at');
      table.string('product');
      table.string('endpoint'); // should include the product's authentication token
    })
  ]);
};

exports.down = function(knex, Promise) {
  Promise.all([
    knex.schema.dropTable('subscribers')
  ]);
};
