var Update = require('../../app/server/models/update');
var expect = require('chai').expect;

describe('Update', function() {
  before(function(done) {
    destroyAll(done);
  });

  after(function(done) {
    destroyAll(done);
  });

  it('automatically sets a uuid', function() {
    new Update().save().then(function(update) {
      expect(update).to.exist;
    });
  });
});

function destroyAll(done) {
  Update.fetchAll().then(function(updates) {
    var count = 0;

    updates.forEach(function(update) {
      update.destroy();
    });

    done();
  });
}
