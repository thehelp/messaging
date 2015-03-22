
'use strict';

var winston = require('winston');

var test = require('thehelp-test');
var expect = test.expect;

var core = require('thehelp-core');
var breadcrumbs = core.breadcrumbs;

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
      From: process.env.TEST_SMS_FROM,
      To: process.env.TEST_SMS_MANUAL_RECEIVE,
      Body: 'thehelp twilio integration test!'
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
      From: process.env.TEST_SMS_FROM,
      To: process.env.TEST_SMS_RECEIVE,
      Body: 'thehelp twilio integration test!'
    };

    app.post('/twilio/sms', twilio.validate, function(req, res) {

      expect(req.body).to.have.property('From', sms.From);
      expect(req.body).to.have.property('To', sms.To);
      expect(req.body).to.have.property('Body', sms.Body);

      res.end();
      done();
    });

    twilio.send(sms, function(err) {
      if (err) {
        throw err;
      }
    });
  });

  it('handles a Twilio error on send', function(done) {
    this.timeout(5000);

    var sms = {
      From: process.env.TEST_SMS_FROM,
      To: process.env.TEST_SMS_MANUAL_RECEIVE,
      Body: 'thehelp twilio integration test!'
    };

    delete twilio.token;

    twilio.send(sms, function(err) {

      expect(err).to.have.property(
        'message',
        'Unauthorized - Your AccountSid or AuthToken was incorrect.'
      );
      expect(err).to.have.property('options').that.deep.equal(sms);
      winston.error(breadcrumbs.toString(err));

      return done();
    });
  });

});
