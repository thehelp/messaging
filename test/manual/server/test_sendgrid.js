
'use strict';

var winston = require('winston');

var test = require('thehelp-test');
var expect = test.expect;

var core = require('thehelp-core');
var breadcrumbs = core.breadcrumbs;

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
    this.timeout(5000);

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
    this.timeout(15000);

    var email = {
      from: process.env.TEST_EMAIL_FROM,
      fromname: 'Sendgrid Integration Test',
      to: process.env.TEST_EMAIL_RECEIVE,
      subject: 'thehelp sendgrid integration test!',
      text: 'Because you definitely need another email...'
    };

    app.post('/sendgrid/email', sendgrid.validate, sendgrid.parse, function(req, res) {

      var from = email.fromname + ' <' + email.from + '>';

      expect(req.body).to.have.property('from', from);
      expect(req.body).to.have.property('to', email.to);
      expect(req.body).to.have.property('subject', email.subject);
      expect(req.body).to.have.property('text', email.text + '\n');

      res.end();
      done();
    });

    sendgrid.send(email, function(err) {
      if (err) {
        throw err;
      }
    });
  });

  it('handles a Sendgrid error on send', function(done) {
    this.timeout(5000);

    var email = {
      from: process.env.TEST_EMAIL_FROM,
      fromname: 'Sendgrid Integration Test',
      to: process.env.TEST_EMAIL_MANUAL_RECEIVE,
      subject: 'thehelp sendgrid integration test!',
      text: 'Because you definitely need another email...'
    };

    delete sendgrid.password;

    sendgrid.send(email, function(err) {

      expect(err).to.have.property(
        'message',
        'Bad Request - Permission denied, wrong credentials'
      );
      expect(err).to.have.property('options').that.deep.equal(email);
      winston.error(breadcrumbs.toString(err));

      return done();
    });
  });

});
