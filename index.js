'use strict';

/**
 * Module dependencies.
 */
const methods = require('methods');
const http = require('http');
const Test = require('./lib/test.js');
const agent = require('./lib/agent.js');

/**
 * Test against the given `app`,
 * returning a new `Test`.
 *
 * @param {Function|Server} app
 * @return {Test}
 * @api public
 */
module.exports = function(app) {
  const obj = {};

  if (typeof app === 'function') {
    app = http.createServer(app); // eslint-disable-line no-param-reassign
  }

  methods.forEach(function(method) {
    obj[method] = function(url) {
      return new Test(app, method, url);
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
module.exports.agent = agent;
