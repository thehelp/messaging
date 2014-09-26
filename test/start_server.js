
var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');

var app = express();

app.enable('trust proxy');

app.use(morgan('combined'));
app.use(bodyParser.urlencoded({
  extended: true
}));

var port = 3000;
console.log('Starting test server, listening on port ' + port);
app.listen(port);

module.exports = app;
