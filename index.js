'use strict';

/**
 * Module dependencies.
 */
const methods = require('methods');
const Test = require('./lib/test');
const http = require('http');
const http2 = require('http2');

/**
 * Test against the given `app`,
 * returning a new `Test`.
 *
 * @param {Function|Server} app
 * @return {Test}
 * @api public
 */
module.exports = function(app, options = {}) {
  var obj = {};

  if (typeof app === 'function') {
    if (options.http2) {
      app = http2.createServer(app); // eslint-disable-line no-param-reassign
    } else {
      app = http.createServer(app); // eslint-disable-line no-param-reassign
    }
  }

  methods.forEach(function(method) {
    obj[method] = function(url) {
      var test = new Test(app, method, url);
      if (options.http2) {
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
 * Expose the agent function
 */
module.exports.agent = require('./lib/agent');
