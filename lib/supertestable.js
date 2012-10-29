/**
 * Module dependencies.
 */

var util = require('util'),
    http = require('http'),
    assert = require('assert');
/**
 * Expose `supertestable mixin`.
 */
module.exports = function (request) {
    var end = request.end;

    request.end = function (fn) {
        var self = this;
        end.call(this, function (res) {
            self.assert(res, fn);
        });

        return this;
    };

    request.expect = function (a, b, c) {

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

    request.assert = function (res, fn) {
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
            return fn(new Error('expected ' + status + ' "' + a + '", got ' + res.status + ' "' + b + '"'),
                      res);
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
}