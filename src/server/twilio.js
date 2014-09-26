/*
# Twilio
This class makes it easy to send text messages with
[Twilio's REST API](http://www.twilio.com/docs/api/rest). Two environment variables
are required:

1. TWILIO_KEY - your "Account SID" on your
[Account Detail](https://www.twilio.com/user/account) page.
2. TWILIO_TOKEN - your "Auth Token" on that same page.
*/

'use strict';

var superagent = require('superagent');

function Twilio(options) {
  /*jshint maxcomplexity: 9 */

  options = options || {};

  this.key = options.key || process.env.THEHELP_TWILIO_KEY;
  if (!this.key) {
    throw new Error('need to set environment variable (TWILIO_KEY)');
  }

  this.token = options.token || process.env.THEHELP_TWILIO_TOKEN;
  if (!this.token) {
    throw new Error('need to set environment variable (TWILIO_TOKEN)');
  }

  this.twilio = options.twilio;
  this.development = options.development;
  if (typeof this.development === 'undefined') {
    options.development = process.env.NODE_ENV === 'development';
  }

  this.validate = this.validate.bind(this);

  this.superagent = options.superagent || superagent;
}

// Commonly-Used Methods
// --------

/*
`send` assembles the right request for
[Twilio's Send REST API](https://www.twilio.com/docs/api/rest/sending-sms),
parsing the return value for successful send status and returning an error
if it isn't found.

_NOTE: It will truncate any message you send if necessary, warning in the log when
that becomes necessary._
*/
Twilio.prototype.send = function send(options, cb) {
  var _this = this;
  options = options || {};

  if (!options.to) {
    return cb(new Error('twilio/send: need options.to!'));
  }
  if (!options.from) {
    return cb(new Error('twilio/send: need options.from!'));
  }
  if (!options.body) {
    return cb(new Error('twilio/send: need options.body!'));
  }

  this.superagent
    .post('https://api.twilio.com/2010-04-01/Accounts/' + this.key + '/SMS/Messages.json')
    .auth(this.key, this.token)
    .type('form')
    .send({
      To: options.to,
      From: options.from,
      Body: options.body
    })
    .end(function(res) {
      _this._sendFinish(res, cb);
    });
};

// `_sendFinish` handles the payload returned to us from the call to Twilio.
Twilio.prototype._sendFinish = function _sendFinish(res, cb) {
  //I've seen only 201 for success. But we allow for 202 as well.
  if (res.status > 202) {
    return cb(new Error(res.body.message || 'Something went wrong!'));
  }

  return cb(null, res.body);
};

// SMS processing
// --------

/*
`getMaxLength` goes through the full set of steps required to capture the maximumn
length for an SMS, so it doesn't get truncated on send:

1. The `max` starts at 160
2. If the string contains unicode, that `max` goes down to 70
3. If there's some additional text that still needs to be added to the message, of length
`buffer`, we subtract that from the `max`.
4. We subract the number of characters requiring escaping from the `max`.
*/
Twilio.prototype.getMaxLength = function getMaxLength(text, buffer) {
  var max = 160;

  if (this.containsUnicode(text)) {
    max = 70;
  }

  if (buffer) {
    max -= buffer;
  }

  max -= this.escapeCharacterCount(text);

  return max;
};

/*
`truncate` calculates the max length for the provided `text`, and then does the
truncation for you. If a truncation is required, the last three characters will be '...'.
*/
Twilio.prototype.truncate = function truncate(text, buffer) {
  var max = this.getMaxLength(text, buffer);
  return this._truncate(max, text);
};

// `escapeCharacterCount` finds the number of characters that require escaping
// io text messages, as listed in this
// [blog post](http://www.twilio.com/engineering/2012/11/08/adventures-in-unicode-sms).
Twilio.prototype.escapeCharacterCount = function escapeCharacterCount(text) {
  var result = 0;
  var escapes = /[\|\^{}€\[~\]\\]/g;
  var match = text.match(escapes);
  if (match) {
    result += match.length;
  }

  return result;
};

/*
`containsUnicode` tries to determine if a text contains characters which will flip the
text message infrastructure into a different encoding, reducing the number of
available characters to 70.

We do a simple check, looking for just the first block of characters from
[Part 1: Latin alphabet #1 (ISO/IEC 8859-1)](http://en.wikipedia.org/wiki/ISO/IEC_8859-1).
It's an imperfect stand-in for the characters actually supported
in the [GSM 7-bit encoding system](http://bit.ly/1lCFVcJ), so if texting ever gets very
important to an app, and it's sending input from users, we'll need to get a lot better at
this.
*/
Twilio.prototype.containsUnicode = function containsUnicode(text) {
  return (/[^\u0000-\u007E]/).test(text);
};

// `truncate` returns a string with `limit` characters or less. If the original string
// was longer than `limit` characters, it will be truncated to fit. Any truncated
// string will end with an ellipsis ("...") to signify that it's missing info.
Twilio.prototype._truncate = function _truncate(limit, text) {
  var result;
  if (text.length > limit) {
    result = text.substring(0, limit - 3);
    result += '...';
    return result;
  }
  return text;
};

// Express middleware
// =======

/*
Documentation kind of sucks for incoming SMS on Twilio, but there is some:

+ <https://www.twilio.com/docs/quickstart/php/sms/hello-monkey>
*/

/*
It just so happens that the `twilio` npm package provides a
[nice little function](http://twilio.github.io/twilio-node/#validateExpressRequest) to
validate an incoming request. This little bit of middleware calls that when not in
development mode, using the Twilio API Key and Token you've already provided.

Just put it in front of your POST handler:
```
app.post('/twilio/sms', twilio.validate, function(req, res) {
  console.log(req.body);
  res.status(200);
  res.end();
})
```

Some trouble-shooting tips:

+ To use this, you have to install the `twilio` node module and pass it in on construction
+ Did you install any middleware to parse the
[`urlencoded`](https://github.com/expressjs/body-parser#bodyparserurlencodedoptions)
body of the request?
+ Disable CSRF checking for this endpoint
+ The validation function gets the `host` and `protocol` from Express. If you're beind
a proxy, it's easiest to `app.enable('trust proxy');`

*/
Twilio.prototype.validate = function validate(req, res, next) {
  var err;

  if (!this.twilio) {
    err = new Error('Need to set options.twilio');
    return next(err);
  }

  if (!this.development && !this.twilio.validateExpressRequest(req, this.token)) {
    err = new Error('Request did not pass twilio validation');
    err.body = req.body;
    err.status = 400;
    err.text = 'You aren\'t twilio, are you?';
    return next(err);
  }

  next();
};


module.exports = Twilio;
