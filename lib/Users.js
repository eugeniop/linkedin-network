var request = require('request'),
    async = require('async'),
    Feed = require('./Feed');

/**
 * [Users description]
 *
 * options: 
 *   - access_token
 *   - pageSize 
 */

function Users(options){
  this.options = options;
  this._getToken = function(callback) {
    callback(null, this.options.access_token);
  };
}

Users.prototype.getPage = function(url, done) {

  var self = this;
  
  var baseUrl = 'https://api.linkedin.com/v1/people/~/connections:(id,headline,first-name,last-name,picture-url)?';

  if(typeof url === 'function'){
    done = url;
    url = null;
  }

  url = url || baseUrl + "&start=0&count=" + this.options.pageSize.toString();

  this._getToken(function (err, token){
    if (err) return done(err);
    request.get({
      url: url,
      qs: { oauth2_access_token: token },
      headers: { 
        'x-li-format': 'json' 
      }
    }, function (err, resp, body) {
      if (err) return done(err);

      if( resp.statusCode === 200 ){
        if(~resp.headers['x-li-format'].indexOf('json')){
          body = JSON.parse(body);
          return done(null, new Feed(baseUrl,self.options.pageSize,body));
        }
      }

      if (resp.statusCode === 401) {
        return done(new Error('unauthorized'));
      }
      
      return done(new Error(body));
    });
  }.bind(this));
};

//Iterates on getPage until all users are retrieved 
Users.prototype.getAll = function(done) {
  var results = [];
  async.whilst(
    function () {
      return results.length === 0 || !results.slice(-1)[0].isLastPage();
    },
    function (callback) {
      var url = results.length > 0 ? results.slice(-1)[0].getNextLink() : null;

      this.getPage(url, function (err, result) { 
        if(err) return callback(err);
        results.push(result);
        callback();
      });
      
    }.bind(this),
    function (err) {
      if (err) return done(err);
      var entries = results.reduce(function (prev, current) {
        return prev.concat(current.values);
      }, []);
      done(null, results, entries);
    }
  );
};

module.exports = Users;