/*
# Twilio
This class makes it easy to send text messages with
[Twilio's REST API](http://www.twilio.com/docs/api/rest). Two environment variables
are required:

1. TWILIO_KEY - your "Account SID" on your [Account Detail](https://www.twilio.com/user/account) page.
2. TWILIO_TOKEN - your "Auth Token" on that same page.
*/

'use strict';

var winston = require('winston');
var superagent = require('superagent');
var core = require('thehelp-core');

var general = core.general;
var string = core.string;

function Twilio(options) {
  /*jshint maxcomplexity: 9 */

  options = options || {};

  this.key = options.key || process.env.TWILIO_KEY;
  if (!this.key) {
    throw new Error('need to set environment variable (TWILIO_KEY)');
  }

  this.token = options.token || process.env.TWILIO_TOKEN;
  if (!this.token) {
    throw new Error('need to set environment variable (TWILIO_TOKEN)');
  }

  this.general = options.general || general;
  this.winston = options.winston || winston;
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
Twilio.prototype.send = function(options, cb) {
  options = options || {};

  if (general.checkPrecondition(options.to, 'twilio/send: need options.to!', cb)) {
    return;
  }
  if (general.checkPrecondition(options.from, 'twilio/send: need options.from!', cb)) {
    return;
  }
  if (general.checkPrecondition(options.body, 'twilio/send: need options.body!', cb)) {
    return;
  }

  var truncated = this.truncateForSMS(options.body);
  if (truncated !== options.body) {
    this.winston.warn('Twilio.send - message was truncated before sending. Original: ' + options.body);
  }

  superagent
    .post('https://api.twilio.com/2010-04-01/Accounts/' + this.key + '/SMS/Messages.json')
    .auth(this.key, this.token)
    .type('form')
    .send({
      To: options.to,
      From: options.from,
      Body: truncated
    })
    .end(function(res) {
      //I've seen only 201 for success. But we allow for 202 as well.
      if (res.status > 202) {
        return cb(new Error(res.body.message || 'Something went wrong!'));
      }

      return cb(null, res.body);
    });
};

// Utility Methods
// --------

// `escapeCharacterCount` finds the number of characters that require escaping
// io text messages, as listed in
// [this blog post](http://www.twilio.com/engineering/2012/11/08/adventures-in-unicode-sms).
Twilio.prototype.escapeCharacterCount = function(text) {
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

We do a simple check, looking for just the first block of characters from from
[Part 1: Latin alphabet No. 1 (ISO/IEC 8859-1)](http://en.wikipedia.org/wiki/ISO/IEC_8859-1). It's an imperfect stand-in
for the characters actually supported
in the [GSM 7-bit encoding system](http://en.wikipedia.org/wiki/GSM_03.38#GSM_7_bit_default_alphabet_and_extension_table_of_3GPP_TS_23.038_.2F_GSM_03.38),
so if texting ever gets very important to an app, and it's sending input from users,
we'll need to get a lot better at this.
*/
Twilio.prototype.containsUnicode = function(text) {
  return (/[^\u0000-\u007E]/).test(text);
};

/*
`truncateForSMS` goes through the full set of steps required to ensure that a given
SMS doesn't get truncated:

1. The `max` starts at 160
2. If the string contains unicode, that `max` goes down to 70
3. If there's some additional text that still needs to be added to the message, of length
`buffer`, we subtract that from the `max`.
4. We subract the number of characters requiring escaping from the `max`.
5. Finally, we return the truncated string.
*/
Twilio.prototype.truncateForSMS = function(text, buffer) {
  var max = 160;

  if (this.containsUnicode(text)) {
    max = 70;
  }

  if (buffer) {
    max -= buffer;
  }

  max -= this.escapeCharacterCount(text);

  return string.truncate(max, text);
};

module.exports = Twilio;