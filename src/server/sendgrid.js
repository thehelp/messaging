/*
# Sendgrid
This class is a thin wrappper around the `nodemailer` node module, sending email
via [Sendgrid's SMTP API](http://sendgrid.com/docs/API_Reference/SMTP_API/index.html). Two
environment variables are required

1. SENDGRID_USERNAME - this is your raw Sendgrid account username
2. SENDGRID_PASSWORD - unfortunately, this is the same password as your account. Not an
account API access token. :0(
*/

'use strict';

var winston = require('winston');
var nodemailer = require('nodemailer');

var core = require('thehelp-core');
var general = core.general;

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
}

// Commonly-Used Methods
// --------

// `send` checks that all four required keys are included on the provided
// `email` object: `to`, `from`, `body`, and `subject`. Then we create a `nodemailer`
// transport, send with it, and immediately close the transport (this class isn't
// designed for high-volume sending).
SendGrid.prototype.send = function(email, cb) {
  email = email || {};

  if (general.checkPrecondition(email.to, 'sendgrid/send: need email.to!', cb)) {
    return;
  }
  if (general.checkPrecondition(email.from, 'sendgrid/send: need email.from!', cb)) {
    return;
  }
  if (general.checkPrecondition(email.body, 'sendgrid/send: need email.body!', cb)) {
    return;
  }
  if (general.checkPrecondition(email.subject, 'sendgrid/send: need email.subject!',
    cb)) {

    return;
  }

  email.text = email.body;
  delete email.body;

  var transport = this.createTransport();

  transport.sendMail(email, function(err, response) {
    transport.close();

    if (general.checkError('Sendgrid/send/sendMail', err, cb)) {
      return;
    }

    winston.verbose('sendgrid/send successful: ' + response.message);

    return cb(null, response);
  });
};

// Utility Methods
// --------

// `createTransport` supplies `nodemailer` what it needs to get ready to send.
SendGrid.prototype.createTransport = function() {
  return nodemailer.createTransport('SMTP', {
    service: 'SendGrid',
    auth: {
      user: this.username,
      pass: this.password
    }
  });
};

module.exports = SendGrid;
