
/**
 * Module dependencies.
 */

var methods = require('./lib/methods')
  , Test = require('./lib/test')
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
