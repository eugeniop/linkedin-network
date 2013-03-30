var Users = require('../lib/index').Users,
    testingKeys = require('../testing-keys');

describe.only('Users module', function () {

  var users = new Users({
    access_token:     testingKeys.access_token,
    pageSize:         testingKeys.pageSize
  });
  
  it('retrieve first page of users', function (done) {
    users.getPage(function (err, result) {
      if (err) return done(err);
      result.should.have.property('values');
      done();
    });
  });
  
  it('can fetch an specific page of users', function (done) {
    var page ='https://api.linkedin.com/v1/people/~/connections:(id,headline,first-name,last-name,picture-url)?start=0&count=10';
    users.getPage(page, function (err, result) {
      if (err) return done(err);
      result.should.have.property('values');
      done();
    });
  });
  
  it('should return proper error with an invalid access token', function (done) {
    var usersFail = new Users({
      access_token:      "whatever",
      pageSize: 100
    });
    usersFail.getPage(function (err) {
      err.message.should.be.eql('unauthorized');
      done();
    });
  });

  it('can fetch all users', function (done) {
    users.getAll(function(err, results, entries) {
      results[0].should.have.property('values');

      var allEntries = results.reduce(function (prev, currentFeed) {
        return prev.concat(currentFeed.values);
      }, []);

      entries.length.should.eql(allEntries.length);

      done();
    });
  });
});