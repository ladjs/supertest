
/**
 * Module dependencies.
 */

var Agent = require('superagent').agent
  , methods = require('methods')
  , http = require('http')
  , Test = require('./test');

/**
 * Expose `Agent`.
 */

module.exports = TestAgent;

/**
 * Initialize a new `TestAgent`.
 *
 * @param {Function|Server} app
 * @param {Object} options
 * @api public
 */

function TestAgent(app, options){
  if (!(this instanceof TestAgent)) return new TestAgent(app, options);
  if ('function' == typeof app) app = http.createServer(app);
  if (options) this._ca = options.ca;
  Agent.call(this);
  this.app = app;
}

/**
 * Inherits from `Agent.prototype`.
 */

TestAgent.prototype.__proto__ = Agent.prototype;

// override HTTP verb methods
methods.forEach(function(method){
  TestAgent.prototype[method] = function(url, fn){
    var req = new Test(this.app, method.toUpperCase(), url);
    req.ca(this._ca);

    req.on('response', this.saveCookies.bind(this));
    req.on('redirect', this.saveCookies.bind(this));
    req.on('redirect', this.attachCookies.bind(this, req));
    this.attachCookies(req);

    return req;
  };
});

/**
 * Cleans up any resources created by a TestAgent instance
 * @param {Function} cb callback after cleanup has been performed.
 * @api public
 */
TestAgent.prototype.destroy = function(cb){
  if (this.app && this.app.close){
    this.app.close(function(err){
      //if its not running ignore the error
      if(err && /not running/i.test(err.message)){
        err = null;
      }
      cb(err);
    })
  } else {
    process.nextTick(cb);
  }
  //clean up resources
  this.app = null;
}

TestAgent.prototype.del = TestAgent.prototype.delete;
