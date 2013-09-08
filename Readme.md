# SuperTest

  通过[super-agent](http://github.com/visionmedia/superagent)来使得HTTP断言更简单。

## 关于

  （写）该模块的动机是为了对HTTP测试提供高层级抽象的同时也允许你使用super-agent提供的低层级API

## 例子

  你可以传入个`http.Server`或`Function`给`request()` - 如果服务器还未监听链接则它将为你绑定到一个随机的端口这样你就不需要跟踪端口。

  SuperTest（可以与）任何测试框架一起工作，这里是个没有使用任何测试框架的例子：

```js
var request = require('supertest')
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

  这里是个与mocha（测试框架）工作的例子，注意你可以通过直接传递 `done` （参数）给任意的 `.expect()` 调用：

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

  如果你是用 `.end()` 方法If you are using the `.end()` method `.expect()` assertions that fail will
  not throw - they will return the assertion as an error to the `.end()` callback. In
  order to fail the test case, you will need to rethrow or pass `err` to `done()`, as follows:

```js
describe('GET /users', function(){
  it('respond with json', function(done){
    request(app)
      .get('/user')
      .set('Accept', 'application/json')
      .expect(200)
      .end(function(err, res){
        if (err) return done(err);
        done()
      });
  })
})
```

  Anything you can do with superagent, you can do with supertest - for example multipart file uploads!

```js
request(app)
.post('/')
.attach('avatar', 'test/fixtures/homeboy.jpg')
...
```

  Passing the app or url each time is not necessary, if you're testing
  the same host you may simply re-assign the request variable with the
  initialization app or url, a new `Test` is created per `request.VERB()` call.

```js
request = request('http://localhost:5555');

request.get('/').expect(200, function(err){
  console.log(err);
});

request.get('/').expect('heya', function(err){
  console.log(err);
});
```

## API

  You may use any [super-agent](http://github.com/visionmedia/superagent) methods,
  including `.write()`, `.pipe()` etc and perform assertions in the `.end()` callback
  for lower-level needs.

### .expect(status[, fn])

  Assert response `status` code.

### .expect(status, body[, fn])

  Assert response `status` code and `body`.

### .expect(body[, fn])

  Assert response `body` text with a string, regular expression, or
  parsed body object.

### .expect(field, value[, fn])

  Assert header `field` `value` with a string or regular expression.

### .end(fn)

  Perform the request and invoke `fn(err, res)`.

## Notes

  Inspired by [api-easy](https://github.com/flatiron/api-easy) minus vows coupling.

## License

  MIT
