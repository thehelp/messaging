
'use strict';

var test = require('thehelp-test');
var expect = test.expect;

var Sendgrid = require('../../../src/server/sendgrid');
var app = require('../../start_server');
var Busboy = require('busboy');

describe('Sendgrid', function() {
  var sendgrid;

  beforeEach(function() {
    sendgrid = new Sendgrid({
      Busboy: Busboy
    });

    // library variables
    expect(process.env).to.have.property('THEHELP_SENDGRID_USERNAME').that.exist;
    expect(process.env).to.have.property('THEHELP_SENDGRID_PASSWORD').that.exist;
    expect(process.env).to.have.property('THEHELP_SENDGRID_VERIFY').that.exist;

    // test-specific variables
    expect(process.env).to.have.property('TEST_EMAIL_FROM').that.exist;
    expect(process.env).to.have.property('TEST_EMAIL_MANUAL_RECEIVE').that.exist;
    expect(process.env).to.have.property('TEST_EMAIL_RECEIVE').that.exist;
  });


  it('sends an email', function(done) {
    var email = {
      from: process.env.TEST_EMAIL_FROM,
      fromname: 'Sendgrid Integration Test',
      to: process.env.TEST_EMAIL_MANUAL_RECEIVE,
      subject: 'thehelp sendgrid integration test!',
      text: 'Because you definitely need another email...'
    };

    sendgrid.send(email, function(err, response) {
      if (err) {
        throw err;
      }

      expect(response).to.exist;

      return done();
    });
  });

  it('receives an email', function(done) {
    this.timeout(10000);

    var email = {
      from: process.env.TEST_EMAIL_FROM,
      fromname: 'Sendgrid Integration Test',
      to: process.env.TEST_EMAIL_RECEIVE,
      subject: 'thehelp sendgrid integration test!',
      text: 'Because you definitely need another email...'
    };

    app.post('/sendgrid/email', sendgrid.validate, sendgrid.parse, function(req, res) {

      var from = email.fromname + ' <' + email.from + '>';

      expect(req.email).to.have.property('from', from);
      expect(req.email).to.have.property('to', email.to);
      expect(req.email).to.have.property('subject', email.subject);
      expect(req.email).to.have.property('text', email.text + '\n');

      res.end();
      done();
    });

    sendgrid.send(email, function(err) {
      if (err) {
        throw err;
      }
    });
  });

});
