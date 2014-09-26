/*
# Sendgrid
This class is a thin wrappper around the Sendgrid Send mail REST endpoint:
<https://sendgrid.com/docs/API_Reference/Web_API/mail.html>.
*/

'use strict';

var superagent = require('superagent');

/*
Two environment varialbes are required to create a `Sendgrid` instance:

1. `username`/`SENDGRID_USERNAME` - this is your raw Sendgrid account username
2. `password`/`SENDGRID_PASSWORD` - unfortunately, this is the same password as your
account. Not an account API access token. I heartily recommend that you
create additional sub-accounts to use for your programs:
<https://sendgrid.com/docs/User_Guide/multiple_credentials.html>.
*/
function SendGrid(options) {
  /*jshint maxcomplexity: 8 */

  options = options || {};

  this.username = options.username || process.env.THEHELP_SENDGRID_USERNAME;
  if (!this.username) {
    throw new Error('need to provide sendgrid username by options or env var');
  }

  this.password = options.password || process.env.THEHELP_SENDGRID_PASSWORD;
  if (!this.password) {
    throw new Error('need to provide sendgrid password by options or env var');
  }

  this.verify = options.verify || process.env.THEHELP_SENDGRID_VERIFY;
  this.Busboy = options.Busboy;

  this.parse = this.parse.bind(this);
  this.validate = this.validate.bind(this);

  this.superagent = options.superagent || superagent;
}

// Commonly-Used Methods
// --------

/*
`send` checks that all four required keys are included on the provided
`options` object:

+ `to`
+ `from`,
+ `text` or `html`
+ `subject`

More documentation on the endpoint we hit:
<https://sendgrid.com/docs/API_Reference/Web_API/mail.html>. We pass your
payload directly to it, after adding your sendgrid credentials.
*/
SendGrid.prototype.send = function send(options, cb) {
  /*jshint maxcomplexity: 8 */
  /*jshint camelcase: false */
  var _this = this;

  options = options || {};

  if (!options.to) {
    return cb(new Error('sendgrid/send: need options.to!'));
  }
  if (!options.from) {
    return cb(new Error('sendgrid/send: need options.from!'));
  }
  if (!options.text && !options.html) {
    return cb(new Error('sendgrid/send: need either options.text or options.html!'));
  }
  if (!options.subject) {
    return cb(new Error('sendgrid/send: need options.subject!'));
  }

  options.api_user = options.api_user || this.username;
  options.api_key = options.api_key || this.password;

  this.superagent
    .post('https://api.sendgrid.com/api/mail.send.json')
    .type('form')
    .send(options)
    .end(function(res) {
      _this._sendFinish(options, res, cb);
    });
};

// `_sendFinish` handles the payload returned to us from the call to Sendgrid.
SendGrid.prototype._sendFinish = function _sendFinish(options, res, cb) {
  if (res.status !== 200) {
    var body = res.body || {};
    var message = body.message;

    if (body.errors && body.errors.length) {
      message = body.errors[0];
    }

    var err = new Error(message || 'Something went wrong!');
    err.options = options;

    return cb(err);
  }

  return cb(null, res.body);
};

// Express middleware
// =======

/*
To help you deal with requests coming from Sendgrid, described here:
<https://sendgrid.com/docs/API_Reference/Webhooks/parse.html>

_Note: Don't forget to disable CSRF checking for your incoming options endpoint!_
*/

/*
It's kind of a pain to parse incoming Sendgrid optionss because their content type is
'multipart/form-data'. This middleware function pulls all non-file data out of the
Sendgrid request, and then makes that available at `req.body`.

Use it like this:
```
app.post('/sendgrid/options', sendgrid.parse, function(req, res) {
  console.log(req.body)
  res.status(200);
  res.end();
});
```

_Note: You'll need to supply [`Busboy`](https://github.com/mscdex/busboy) to this class
on construction if you want to use this middleware method._Note
*/
SendGrid.prototype.parse = function parse(req, res, next) {
  var type = req.headers['content-type'] || '';
  req.body = req.body || {};

  if (!this.Busboy) {
    var err = new Error('Need to set options.Busboy on construction!');
    return next(err);
  }

  if (type.indexOf('multipart') < 0) {
    return next();
  }

  var busboy = new this.Busboy({headers: req.headers});

  busboy.on('field', function(name, value) {
    req.body[name] = value;
  });

  busboy.on('finish', function() {
    next();
  });

  req.pipe(busboy);
};


/*
But we don't want to accept incoming emails from just anyone. We want to be sure we're
really dealing with Sendgrid. On the
[inbound dashboard](<https://sendgrid.com/developer/reply>) you can add a querystring to
the URL Sendgrid will hit.

This method assumes that you've set up a `verify` querystring and the correct value of
that querystring is either set in the `SENDGRID_VERIFY` environment variable or
directly passed to this class on construction.

We just add one new middleware function:

```
app.post('/sendgrid/options', sendgrid.validate, sendgrid.parse, function(req, res) {
  console.log(req.body)
  res.status(200);
  res.end();
})
```
*/
SendGrid.prototype.validate = function validate(req, res, next) {
  var err;

  if (!this.verify) {
    err = new Error(
      'Need to provide sendgrid verify value on construction or via env var'
    );
    return next(err);
  }

  if (req.query.verify !== this.verify) {
    err = new Error('Request did not pass sendgrid validation');
    err.body = req.body;
    err.query = req.query;
    err.status = 400;
    err.text = 'You aren\'t sendgrid, are you?';
    return next(err);
  }

  next();
};


module.exports = SendGrid;
