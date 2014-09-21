
/**
 * Module dependencies.
 */

var methods = require('methods')
  , Test = require('./lib/test')
  , http = require('http')
  , https = require('https');


/**
 * Test against the given `app`,
 * returning a new `Test`.
 *
 * @param {Function|Server} app
 * @param {Object} options
 * @return {Test}
 * @api public
 */

module.exports = function(app, options){
  options = options || {};
  if ('function' == typeof app) {
    if (options.https) {
      app = https.createServer(app);
    } else {
      app = http.createServer(app);
    }
  }
  var obj = {};

  methods.forEach(function(method){
    obj[method] = function(url){
      return new Test(app, method, url);
    };
  });

  // Support previous use of del
  obj.del = obj['delete'];

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
