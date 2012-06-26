
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
    .end(function(res){
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
      .end(function(res){
        res.should.have.status(200);
        res.text.should.equal('hey');
        done();
      });
    });
  })

  describe('.expect(status[, fn])', function(){
    it('should assert the response status', function(done){
      var app = express();

      app.get('/', function(req, res){
        res.send('hey');
      });

      request(app)
      .get('/')
      .expect(404, function(err){
        err.message.should.equal('expected 404 response, got 200');
        done();
      });
    })
  })
})