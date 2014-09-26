
'use strict';

var test = require('thehelp-test');
var expect = test.expect;

var Twilio = require('../../../src/server/twilio');
var app = require('../../start_server');
var twilioSdk = require('twilio');


describe('Twilio', function() {
  var twilio = null;

  beforeEach(function() {
    twilio = new Twilio({
      twilio: twilioSdk
    });

    // library variables
    expect(process.env).to.have.property('THEHELP_TWILIO_KEY').that.exist;
    expect(process.env).to.have.property('THEHELP_TWILIO_TOKEN').that.exist;

    // test-specific variables
    expect(process.env).to.have.property('TEST_SMS_FROM').that.exist;
    expect(process.env).to.have.property('TEST_SMS_MANUAL_RECEIVE').that.exist;
    expect(process.env).to.have.property('TEST_SMS_RECEIVE').that.exist;
  });

  it('sends an sms', function(done) {
    this.timeout(5000);

    var sms = {
      from: process.env.TEST_SMS_FROM,
      to: process.env.TEST_SMS_MANUAL_RECEIVE,
      body: 'thehelp twilio integration test!'
    };

    twilio.send(sms, function(err) {
      if (err) {
        throw err;
      }

      return done();
    });
  });

  it('receives an sms', function(done) {
    this.timeout(10000);

    var sms = {
      from: process.env.TEST_SMS_FROM,
      to: process.env.TEST_SMS_RECEIVE,
      body: 'thehelp twilio integration test!'
    };

    app.post('/twilio/sms', twilio.validate, function(req, res) {

      expect(req.body).to.have.property('From', sms.from);
      expect(req.body).to.have.property('To', sms.to);
      expect(req.body).to.have.property('Body', sms.body);

      res.end();
      done();
    });

    twilio.send(sms, function(err) {
      if (err) {
        throw err;
      }
    });
  });
});