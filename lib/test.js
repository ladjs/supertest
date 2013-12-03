
/**
 * Module dependencies.
 */

var request = require('superagent')
  , util = require('util')
  , http = require('http')
  , https = require('https')
  , assert = require('assert')
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
  this.redirects(0);
  this.buffer();
  this.app = app;
  this._fields = {};
  this._bodies = [];
  this._asserts = [];
  this.url = 'string' == typeof app
    ? app + path
    : this.serverAddress(app, path);
}

/**
 * Inherits from `Request.prototype`.
 */

Test.prototype.__proto__ = Request.prototype;

/**
 * Returns a URL, extracted from a server.
 *
 * @param {Server} app
 * @param {String} path
 * @returns {String} URL address
 * @api private
 */

Test.prototype.serverAddress = function(app, path){
  var addr = app.address();
  if (!addr) app.listen(0);
  var port = app.address().port;
  var protocol = app instanceof https.Server ? 'https' : 'http';
  return protocol + '://127.0.0.1:' + port + path;
};

/**
 * Expectations:
 *
 *   .expect(200)
 *   .expect(200, fn)
 *   .expect(200, body)
 *   .expect('Some body')
 *   .expect('Some body', fn)
 *   .expect('Content-Type', 'application/json')
 *   .expect('Content-Type', 'application/json', fn)
 *   .expect(fn)
 *
 * @return {Test}
 * @api public
 */

Test.prototype.expect = function(a, b, c){
  var self = this;

  // callback
  if ('function' == typeof a) {
    this._asserts.push(a);
    return this;
  }
  if ('function' == typeof b) this.end(b);
  if ('function' == typeof c) this.end(c);

  // status
  if ('number' == typeof a) {
    this._status = a;
    // body
    if ('function' != typeof b && arguments.length > 1) this._bodies.push(b);
    return this;
  }

  // header field
  if ('string' == typeof b || b instanceof RegExp) {
    if (!this._fields[a]) this._fields[a] = [];
    this._fields[a].push(b);
    return this;
  }

  // body
  this._bodies.push(a);

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
  end.call(this, function(err, res){
    if (err) return fn(err);
    self.assert(res, fn);
  });
  return this;
};

/**
 * Perform assertions and invoke `fn(err)`.
 *
 * @param {Response} res
 * @param {Function} fn
 * @api private
 */

Test.prototype.assert = function(res, fn){
  var status = this._status
    , fields = this._fields
    , bodies = this._bodies
    , expecteds
    , actual
    , re;

  // status
  if (status && res.status !== status) {
    var a = http.STATUS_CODES[status];
    var b = http.STATUS_CODES[res.status];
    return fn(new Error('expected ' + status + ' "' + a + '", got ' + res.status + ' "' + b + '"'), res);
  }

  // body
  for (var i = 0; i < bodies.length; i++) {
    var body = bodies[i];
    var isregexp = body instanceof RegExp;
    // parsed
    if ('object' == typeof body && !isregexp) {
      try {
        assert.deepEqual(body, res.body);
      } catch (err) {
        var a = util.inspect(body);
        var b = util.inspect(res.body);
        return fn(error('expected ' + a + ' response body, got ' + b, body, res.body));
      }
    } else {
      // string
      if (body !== res.text) {
        var a = util.inspect(body);
        var b = util.inspect(res.text);

        // regexp
        if (isregexp) {
          if (!body.test(res.text)) {
            return fn(error('expected body ' + b + ' to match ' + body, body, res.body));
          }
        } else {
          return fn(error('expected ' + a + ' response body, got ' + b, body, res.body));
        }
      }
    }
  }

  // fields
  for (var field in fields) {
    expecteds = fields[field];
    actual = res.header[field.toLowerCase()];
    if (null == actual) return fn(new Error('expected "' + field + '" header field'));
    for (var i = 0; i < expecteds.length; i++) {
      var fieldExpected = expecteds[i];
      if (fieldExpected == actual) continue;
      if (fieldExpected instanceof RegExp) re = fieldExpected;
      if (re && re.test(actual)) continue;
      if (re) return fn(new Error('expected "' + field + '" matching ' + fieldExpected + ', got "' + actual + '"'));
      return fn(new Error('expected "' + field + '" of "' + fieldExpected + '", got "' + actual + '"'));
    }
  }

  // asserts
  for (var i = 0; i < this._asserts.length; i++) {
    var check = this._asserts[i];
    var err;
    try {
      err = check(res);
    } catch(e) {
      err = e;
    }
    if (!err) continue;
    return fn(err instanceof Error ? err : new Error(err))
  }

  fn.call(this, null, res);
};

/**
 * Return an `Error` with `msg` and results properties.
 *
 * @param {String} msg
 * @param {Mixed} expected
 * @param {Mixed} actual
 * @return {Error}
 * @api private
 */

function error(msg, expected, actual) {
  var err = new Error(msg);
  err.expected = expected;
  err.actual = actual;
  err.showDiff = true;
  return err;
}

