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
  options = options || {};

  this.username = options.username || process.env.SENDGRID_USERNAME;
  if (!this.username) {
    throw new Error('need to provide sendgrid username or set environment variable');
  }

  this.password = options.password || process.env.SENDGRID_PASSWORD;
  if (!this.password) {
    throw new Error('need to provide sendgrid password or set environment variable');
  }

  this.superagent = options.superagent || superagent;
}

// Commonly-Used Methods
// --------

// `send` checks that all four required keys are included on the provided
// `email` object: `to`, `from`, `text`, and `subject`. More documentation on the endpoint
// we hit: <https://sendgrid.com/docs/API_Reference/Web_API/mail.html>. We pass your
// payload directly to it, after adding your sendgrid credentials.
SendGrid.prototype.send = function(email, cb) {
  /*jshint maxcomplexity: 8 */
  /*jshint camelcase: false */

  email = email || {};

  if (!email.to) {
    return cb(new Error('sendgrid/send: need email.to!'));
  }
  if (!email.from) {
    return cb(new Error('sendgrid/send: need email.from!'));
  }
  if (!email.text && !email.html) {
    return cb(new Error('sendgrid/send: need either email.text or email.html!'));
  }
  if (!email.subject) {
    return cb(new Error('sendgrid/send: need email.subject!'));
  }

  email.api_user = email.api_user || this.username;
  email.api_key = email.api_key || this.password;

  this.superagent
    .post('https://api.sendgrid.com/api/mail.send.json')
    .type('form')
    .send(email)
    .end(function(res) {
      if (res.status !== 200) {
        var body = res.body || {};
        var message = body.message;

        if (body.errors && body.errors.length) {
          message = body.errors[0];
        }

        return cb(new Error(message || 'Something went wrong'));
      }

      return cb(null, res.body);
    });
};

module.exports = SendGrid;
