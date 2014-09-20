
'use strict';

var test = require('thehelp-test');
var expect = test.expect;

var Twilio = require('../../../src/server/twilio');

describe('Twilio', function() {
  var twilio = null;

  beforeEach(function() {
    twilio = new Twilio();
  });

  it('needed environment variables are in place', function() {
    expect(process.env).to.have.property('TWILIO_KEY').that.exist;
    expect(process.env).to.have.property('TWILIO_TOKEN').that.exist;
    expect(process.env).to.have.property('NOTIFY_SMS_FROM').that.exist;
    expect(process.env).to.have.property('NOTIFY_SMS_TO').that.exist;
  });

  it('sends a text message', function(done) {
    this.timeout(5000);

    var text = {
      from: process.env.NOTIFY_SMS_FROM,
      to: process.env.NOTIFY_SMS_TO,
      body: 'thehelp twilio integration test!'
    };

    twilio.send(text, function(err) {
      if (err) {
        throw err;
      }

      return done();
    });
  });
});
