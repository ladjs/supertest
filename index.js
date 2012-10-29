/**
 * Module dependencies.
 */

var http = require('http')
    , https = require('https')
    , util = require('util')
    , request = require('superagent')
    , Request = request.Request
    , Supertestable = require('./lib/supertestable');

/**
 * Starting port.
 */
var port = 3456;

Supertestable(Request.prototype);

/**
 * Test against the given `app`,
 * returning `enhanced superagent request`.
 *
 * @param {Function|Server} app
 * @return {Request}
 * @api public
 */

module.exports = function (app) {
    if ('function' == typeof app) app = http.createServer(app);
    var addr = app.address();
    var portno = addr ? addr.port : port++;
    if (!addr) app.listen(portno);
    var protocol = app instanceof https.Server ? 'https' : 'http';
    var host = protocol + '://127.0.0.1:' + portno;

    request.Request = function (method, url) {
        var request = new Request(method, host + url);
        request._fields = {};
        request.redirects(0);

        return request;
    }

    return request;
};
