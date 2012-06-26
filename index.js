
/**
 * Module dependencies.
 */

var request = require('superagent')
  , methods = require('./lib/methods')
  , Request = request.Request
  , http = require('http');

module.exports = function(app){
  if ('function' == typeof app) app = http.createServer(app);
  var obj = {};

  methods.forEach(function(method){
    var name = 'delete' == method
      ? 'del'
      : method;

    method = method.toUpperCase();
    obj[name] = function(url){
      return new Test(app, method, url);
    };
  });

  return obj;
};

/**
 * Initialize a new `Test` with the given `app`,
 * request `method` and `path`.
 *
 * @param {Server} app
 * @param {String} method
 * @param {String} path
 * @api public
 */

function Test(app, method, path) {
  Request.call(this, method, path);
  this.app = app;
}

/**
 * Inherits from `Request.prototype`.
 */

Test.prototype.__proto__ = Request.prototype;

/**
 * Defer invoking superagent's `.end()` until
 * the server is listening.
 *
 * @param {Function} fn
 * @api public
 */

Test.prototype.end = function(fn){
  var self = this;
  var end = Request.prototype.end;
  var app = this.app;
  var addr = app.address();
  if (!addr) return app.listen(0, function(){ self.end(fn); });
  this.url = 'http://' + addr.address + ':' + addr.port + this.url;
  end.call(this, fn);
};


