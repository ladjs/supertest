
var request = require('..')
  , express = require('express');

describe('request(app)', function(){
  it('should fire up the app on an ephemeral port', function(done){
    var app = express();

    app.get('/', function(req, res){
      res.send('hey');
    });

    request(app)
    .get('/')
    .end(function(err, res){
      res.should.have.status(200);
      res.text.should.equal('hey');
      done();
    });
  })

  it('should work with an active server', function(done){
    var app = express();

    app.get('/', function(req, res){
      res.send('hey');
    });

    var server = app.listen(4000, function(){
      request(server)
      .get('/')
      .end(function(err, res){
        res.should.have.status(200);
        res.text.should.equal('hey');
        done();
      });
    });
  })

  it('should work with .send() etc', function(done){
    var app = express();

    app.use(express.bodyParser());

    app.post('/', function(req, res){
      res.send(req.body.name);
    });

    request(app)
    .post('/')
    .send({ name: 'tobi' })
    .expect('tobi', done);
  })

  it('should default redirects to 0', function(done){
    var app = express();

    app.get('/', function(req, res){
      res.redirect('/login');
    });

    request(app)
    .get('/')
    .expect(302, done);
  })

  describe('.expect(status[, fn])', function(){
    it('should assert the response status', function(done){
      var app = express();

      app.get('/', function(req, res){
        res.send('hey');
      });

      request(app)
      .get('/')
      .expect(404)
      .end(function(err, res){
        err.message.should.equal('expected 404 "Not Found", got 200 "OK"');
        done();
      });
    })
  })

  describe('.expect(body[, fn])', function(){
    it('should assert the response body', function(done){
      var app = express();

      app.set('json spaces', 0);

      app.get('/', function(req, res){
        res.send({ foo: 'bar' });
      });

      request(app)
      .get('/')
      .expect('hey')
      .end(function(err, res){
        err.message.should.equal('expected \'hey\' response body, got \'{"foo":"bar"}\'');
        done();
      });
    })

    it('should support regular expressions', function(done){
      var app = express();

      app.get('/', function(req, res){
        res.send('foobar');
      });

      request(app)
      .get('/')
      .expect(/^bar/)
      .end(function(err, res){
        err.message.should.equal('expected body \'foobar\' to match /^bar/');
        done();
      });
    })
  })

  describe('.expect(field, value[, fn])', function(){
    it('should assert the header field presence', function(done){
      var app = express();

      app.get('/', function(req, res){
        res.send({ foo: 'bar' });
      });

      request(app)
      .get('/')
      .expect('Content-Foo', 'bar')
      .end(function(err, res){
        err.message.should.equal('expected "Content-Foo" header field');
        done();
      });
    })

    it('should assert the header field value', function(done){
      var app = express();

      app.get('/', function(req, res){
        res.send({ foo: 'bar' });
      });

      request(app)
      .get('/')
      .expect('Content-Type', 'text/html')
      .end(function(err, res){
        err.message.should.equal('expected "Content-Type" of "text/html", got "application/json; charset=utf-8"');
        done();
      });
    })

    it('should assert multiple fields', function(done){
      var app = express();

      app.get('/', function(req, res){
        res.send('hey');
      });

      request(app)
      .get('/')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect('Content-Length', '3')
      .end(done);
    })

    it('should support regular expressions', function(done){
      var app = express();

      app.get('/', function(req, res){
        res.send('hey');
      });

      request(app)
      .get('/')
      .expect('Content-Type', /^application/)
      .end(function(err){
        err.message.should.equal('expected "Content-Type" matching /^application/, got "text/html; charset=utf-8"');
        done();
      });
    })
  })
})