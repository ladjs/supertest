/**
 * Module dependencies.
 */
var methods = require('methods');
var Test = require('./lib/test');
var http = require('http');
var http2;
try {
  http2 = require('http2'); // eslint-disable-line global-require
} catch (_) {
  // eslint-disable-line no-empty
}

/**
 * Test against the given `app`,
 * returning a new `Test`.
 *
 * @param {Function|Server} app
 * @return {Test}
 * @api public
 */
module.exports = function(app) {
  var obj = {};

  if (typeof app === 'function') {
    if (module.exports.http2) {
      app = http2.createServer(app); // eslint-disable-line no-param-reassign
    } else {
      app = http.createServer(app); // eslint-disable-line no-param-reassign
    }
  }

  methods.forEach(function(method) {
    obj[method] = function(url) {
      var test = new Test(app, method, url);
      if (module.exports.http2) {
        test.http2();
      }
      return test;
    };
  });

  // Support previous use of del
  obj.del = obj.delete;

  return obj;
};

/**
 * Expose `Test`
 */
module.exports.Test = Test;

/**
 * Expose enable http2 property
 */
module.exports.http2 = false;

/**
 * Expose the agent function
 */
module.exports.agent = require('./lib/agent');
