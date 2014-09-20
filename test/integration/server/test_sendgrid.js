
'use strict';

var test = require('thehelp-test');
var expect = test.expect;

var Sendgrid = require('../../../src/server/sendgrid');

describe('Sendgrid', function() {
  var sendgrid;

  beforeEach(function() {
    sendgrid = new Sendgrid();
  });

  it('needed environment variables are in place', function() {
    expect(process.env).to.have.property('SENDGRID_USERNAME').that.exist;
    expect(process.env).to.have.property('SENDGRID_PASSWORD').that.exist;
    expect(process.env).to.have.property('NOTIFY_EMAIL_TO').that.exist;
    expect(process.env).to.have.property('NOTIFY_EMAIL_FROM').that.exist;
  });

  it('sends mail', function(done) {
    var email = {
      from: 'Sendgrid Integration Test <' + process.env.NOTIFY_EMAIL_FROM + '>',
      to: process.env.NOTIFY_EMAIL_TO,
      subject: 'thehelp sendgrid integration test!',
      body: 'Because you definitely need another email...'
    };

    sendgrid.send(email, function(err, response) {
      if (err) {
        throw err;
      }

      expect(response).to.exist;

      return done();
    });
  });

});
