

/**
 * Module dependencies.
 */

var request = require('superagent')
  , util = require('util')
  , Request = request.Request;

/**
 * Expose `Test`.
 */

module.exports = Test;

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
  this._fields = {};
}

/**
 * Inherits from `Request.prototype`.
 */

Test.prototype.__proto__ = Request.prototype;

/**
 * Expectations:
 *
 *   .expect(200)
 *   .expect(200, fn)
 *   .expect('Some body')
 *   .expect('Some body', fn)
 *   .expect('Content-Type', 'application/json')
 *   .expect('Content-Type', 'application/json', fn)
 *
 * @return {Test}
 * @api public
 */

Test.prototype.expect = function(val, fn){
  var self = this;

  switch (typeof val) {
    // status
    case 'number':
      this._status = val;
      break;
    // body
    case 'string':
      // header field
      if ('string' == typeof fn) {
        this._fields[val] = fn;
        fn = arguments[2];
      } else {
        this._body = val;
      }
  }

  // callback
  if ('function' == typeof fn) this.end(fn);

  return this;
};

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
  end.call(this, function(res){
    self.assert(res, fn);
  });
};

/**
 * Perform assertions and invoke `fn(err)`.
 *
 * @param {Response} res
 * @param {Function} fn
 * @api private
 */

Test.prototype.assert = function(res, fn){
  var status = this._status;
  var body = this._body;

  // status
  if (status && res.status !== status) {
    return fn(new Error('expected ' + status + ' response, got ' + res.status), res);
  }

  // body
  if (null != body && body !== res.text) {
    var a = util.inspect(body);
    var b = util.inspect(res.text);
    return fn(new Error('expected ' + a + ' response body, got ' + b));
  }

  fn(null, res);
};

