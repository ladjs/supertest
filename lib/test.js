
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
 * Starting port.
 */

var port = process.env.PORT || 3456;
var host = process.env.IP || "127.0.0.1";

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
  
  var self = this;
  
  this.redirects(0);
  this.app = app;
  this._fields = {};
  // this variable is used to determine whether we can accept the call already
  this.$ready = false;
  
  if (typeof app === "string") {
      this.url = app + path;
      this.$ready = true;
  }
  else {
      this.serverAddress(app, path, function (err, url) {
          console.log("im ready!");
          self.url = url;
          self.$ready = true;
      });
  }
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

Test.prototype.serverAddress = function(app, path, callback) {
  var protocol = app instanceof https.Server ? 'https' : 'http';
  var addr = typeof app === "object" && typeof app.address === 'function' ? app.address() : null;
  
  if (!addr) {
      addr = { 
          port: port++,
          host: host
      };
      // if we arent listening somewhere yet, then we're going to do it now
      var server = (protocol === "http" ? http.createServer(app) : https.createServer(app));
      server.listen(addr.port, addr.host);
      server.once("listening", function () {
          callback(null, protocol + "://" + addr.host + ":" + addr.port + path);
      });
  }
  else {
      callback(null, protocol + "://" + addr.host + ":" + addr.port + path);
  }
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
 *
 * @return {Test}
 * @api public
 */

Test.prototype.expect = function(a, b, c){
  // callback
  if ('function' == typeof b) this.end(b);
  if ('function' == typeof c) this.end(c);

  // status
  if ('number' == typeof a) {
    this._status = a;
    // body
    if ('function' != typeof b) this._body = b;
    return this;
  }

  // header field
  if ('string' == typeof b || b instanceof RegExp) {
    this._fields[a] = b;
    return this;
  }

  // body
  this._body = a;

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
  
  if (!self.$ready) {
      var readyCounter = self.$readyCounter = (self.$readyCounter || 0) + 1;
      if (readyCounter > 10) {
          return fn(new Error("server didn't listen within 1000 ms."));
      }
      
      var t = this, a = arguments;
      return setTimeout(function () {
          Test.prototype.end.apply(t, a);
      }, 100);
  }
  
  end.call(this, function(res){
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
    , body = this._body
    , isregexp = body instanceof RegExp
    , expected
    , actual
    , re;

  // status
  if (status && res.status !== status) {
    var a = http.STATUS_CODES[status];
    var b = http.STATUS_CODES[res.status];
    return fn(new Error('expected ' + status + ' "' + a + '", got ' + res.status + ' "' + b + '"'), res);
  }

  // body
  if (null != body) {
    // parsed
    if ('object' == typeof body && !isregexp) {
      try {
        assert.deepEqual(body, res.body);
      } catch (err) {
        var a = util.inspect(body);
        var b = util.inspect(res.body);
        return fn(new Error('expected ' + a + ' response body, got ' + b));
      }
    } else {
      // string
      if (body !== res.text) {
        var a = util.inspect(body);
        var b = util.inspect(res.text);

        // regexp
        if (isregexp) {
          if (!body.test(res.text)) {
            return fn(new Error('expected body ' + b + ' to match ' + body));
          }
        } else {
          return fn(new Error('expected ' + a + ' response body, got ' + b));
        }
      }
    }
  }

  // fields
  for (var field in fields) {
    expected = fields[field];
    actual = res.header[field.toLowerCase()];
    if (null == actual) return fn(new Error('expected "' + field + '" header field'));
    if (expected == actual) continue;
    if (expected instanceof RegExp) re = expected;
    if (re && re.test(actual)) continue;
    if (re) return fn(new Error('expected "' + field + '" matching ' + expected + ', got "' + actual + '"'));
    return fn(new Error('expected "' + field + '" of "' + expected + '", got "' + actual + '"'));
  }

  fn(null, res);
};

