
'use strict';

var test = require('thehelp-test');
var core = test.core;

var Sendgrid = require('../../../src/server/sendgrid');

describe('Sendgrid', function() {
  var sendgrid;

  beforeEach(function() {
    sendgrid = new Sendgrid();
  });

  it('needed environment variables are in place', function() {
    core.processVar('process.env.SENDGRID_USERNAME', process.env.SENDGRID_USERNAME);
    core.processVar('process.env.SENDGRID_PASSWORD', process.env.SENDGRID_PASSWORD);
    core.processVar('process.env.NOTIFY_EMAIL_TO', process.env.NOTIFY_EMAIL_TO);
    core.processVar('process.env.NOTIFY_EMAIL_FROM', process.env.NOTIFY_EMAIL_FROM);
  });

  it('sends mail', function(done) {
    var email = {
      from: 'Sendgrid Integration Test <' + process.env.NOTIFY_EMAIL_FROM + '>',
      to: process.env.NOTIFY_EMAIL_TO,
      subject: 'thehelp sendgrid integration test!',
      body: 'Because you definitely need another email...'
    };

    sendgrid.send(email, function(err, response) {
      core.processError('send', err);
      core.processVar('response', response);
      return done();
    });
  });

});
