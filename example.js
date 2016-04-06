'use strict';

const request = require('./'),
  express = require('express'),
  app = express();

app.get('/user', (req, res) => {
  res.status(201).json({
    name: 'tobi'
  });
});

request(app)
  .get('/user')
  .expect('Content-Type', /json/)
  .expect('Content-Length', '15')
  .expect(201)
  .end((err, res) => {
    if (err) throw err;
    console.log('done');
    process.exit();
  });