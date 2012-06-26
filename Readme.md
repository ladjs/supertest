
# SuperTest

  HTTP assertions made easy via [super-agent](http://github.com/visionmedia/superagent).

## About

  The motivation with this module is to provide a high-level abstraction for testing
  HTTP, while still allowing you to drop down to the lower-level API provided by super-agent.

## Example

  You may pass an `http.Server`, or a `Function` to `request()` - if the server is not
  already listening for connections then it is bound to an ephemeral port for you so
  there is no need to keep track of ports.

  SuperTest works with any test framework, here is an example without using any 
  test framework at all:

```js
var request = require('./')
  , express = require('express');

var app = express();

app.get('/user', function(req, res){
  res.send(201, { name: 'tobi' });
});

request(app)
  .get('/user')
  .expect('Content-Type', /json/)
  .expect('Content-Length', '20')
  .expect(201)
  .end(function(err, res){
    if (err) throw err;
  });
```

  Here's an example with mocha, note how you can pass `done` straight to any of the `.expect()` calls:

```js
describe('GET /users', function(){
  it('respond with json', function(done){
    request(app)
      .get('/user')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done);
  })
})
```

## API

  You may use any [super-agent](http://github.com/visionmedia/superagent) methods,
  including `.write()`, `.pipe()` etc and perform assertions in the `.end()` callback
  for lower-level needs.

### .expect(status[, fn])

  Assert response `status` code.

### .expect(body[, fn])

  Assert response `body` text with a string or regular expression.

### .expect(field, value[, fn])

  Assert header `field` `value` with a string or regular expression.

### .end(fn)

  Perform the request and invoke `fn(err, res)`.