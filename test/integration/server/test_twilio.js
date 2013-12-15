
'use strict';

var test = require('thehelp-test');
var core = test.core;

var Twilio = require('../../../src/server/twilio');

describe('Twilio', function() {
  var twilio = null;

  beforeEach(function() {
    twilio = new Twilio();
  });

  it('needed environment variables are in place', function() {
    core.showLogs = false;
    core.processVar('process.env.TWILIO_KEY', process.env.TWILIO_KEY);
    core.processVar('process.env.TWILIO_TOKEN', process.env.TWILIO_TOKEN);
    core.processVar('process.env.NOTIFY_SMS_FROM', process.env.NOTIFY_SMS_FROM);
    core.processVar('process.env.NOTIFY_SMS_TO', process.env.NOTIFY_SMS_TO);
  });

  it('sends a text message', function(done) {
    this.timeout(5000);

    var text = {
      from: process.env.NOTIFY_SMS_FROM,
      to: process.env.NOTIFY_SMS_TO,
      body: 'thehelp twilio integration test!'
    };

    twilio.send(text, function(err) {
      core.processError('send', err);

      return done();
    });
  });
});
