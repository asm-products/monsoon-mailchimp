var Update = require('../../models').Update;
var expect = require('chai').expect;

describe('Update', function() {
  before(function(done) {
    Update.sync().done(done);
  });
  
  after(function(done) {
    Update.drop().done(done);
  });

  it('automatically sets a uuid', function(done) {
    Update.create({ current_count: 0, sent_at: new Date(0), product: 'test' }).then(function(update) {
      expect(update.id).not.to.be.undefined;
      done();
    }).catch(done);
  });
});
