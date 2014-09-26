
'use strict';

var test = require('thehelp-test');
var expect = test.expect;

var Sendgrid = require('../../../src/server/sendgrid');

describe('Sendgrid', function() {
  var sendgrid, username, password, verify;

  beforeEach(function() {
    var username, password;

    username = process.env.THEHELP_SENDGRID_USERNAME;
    password = process.env.THEHELP_SENDGRID_PASSWORD;
    verify = process.env.THEHELP_SENDGRID_VERIFY;

    sendgrid = new Sendgrid({
      username: 'something',
      password: 'another thing',
      verify: 'randomness'
    });
  });

  afterEach(function() {
    process.env.THEHELP_SENDGRID_USERNAME = username;
    process.env.THEHELP_SENDGRID_PASSWORD = password;
    process.env.THEHELP_SENDGRID_VERIFY = verify;
  });

  describe('constructor', function() {
    /*jshint nonew: false */

    it('throws if THEHELP_SENDGRID_USERNAME is not defined', function() {
      delete process.env.THEHELP_SENDGRID_USERNAME;

      expect(function() {
        new Sendgrid();
      }).to['throw']().that.match(/sendgrid username/);
    });

    it('does not throw if username param is provided', function() {
      delete process.env.THEHELP_SENDGRID_USERNAME;

      expect(function() {
        new Sendgrid({
          username: 'something'
        });
      }).not.to['throw']();
    });

    it('throws if THEHELP_SENDGRID_PASSWORD is not defined', function() {
      delete process.env.THEHELP_SENDGRID_PASSWORD;

      expect(function() {
        new Sendgrid();
      }).to['throw']().that.match(/sendgrid password/);
    });

    it('does not throw if password param is provided', function() {
      delete process.env.THEHELP_SENDGRID_PASSWORD;

      expect(function() {
        new Sendgrid({
          password: 'something'
        });
      }).not.to['throw']();
    });
  });

  // Sending SMS

  describe('#send', function() {
    it('returns error if to is not provided', function(done) {
      var email = {
        from: 'from',
        text: 'text',
        subject: 'subject'
      };

      sendgrid.send(email, function(err) {
        expect(err).to.have.property('message').that.match(/options.to/);
        done();
      });
    });

    it('returns error if from is not provided', function(done) {
      var email = {
        to: 'to',
        text: 'text',
        subject: 'subject'
      };

      sendgrid.send(email, function(err) {
        expect(err).to.have.property('message').that.match(/options.from/);
        done();
      });
    });

    it('returns error if text and html not provided', function(done) {
      var email = {
        to: 'to',
        from: 'from',
        subject: 'subject'
      };

      sendgrid.send(email, function(err) {
        expect(err).to.have.property('message').that.match(/options.text/);
        done();
      });
    });

    it('returns error if subject not provided', function(done) {
      var email = {
        to: 'to',
        from: 'from',
        html: 'html'
      };

      sendgrid.send(email, function(err) {
        expect(err).to.have.property('message').that.match(/options.subject/);
        done();
      });
    });
  });

  describe('#_sendFinish', function() {
    it('returns error if res.status is 400', function(done) {
      var response = 'error from sendgrid';
      var res = {
        status: 400,
        body: {
          errors: [response]
        }
      };
      var options = {
        to: 'blah',
        from: 'blah',
        text: 'something',
        subject: 'subject'
      };

      sendgrid._sendFinish(options, res, function(err) {
        expect(err).to.have.property('message').that.equal(response);
        expect(err).to.have.property('options').that.deep.equal(options);

        done();
      });
    });

    it('handles a null body', function(done) {
      var res = {
        status: 400
      };

      sendgrid._sendFinish(null, res, function(err) {
        expect(err).to.have.property('message').that.equal('Something went wrong!');
        done();
      });
    });

    it('handles a null body', function(done) {
      var res = {
        status: 400
      };

      sendgrid._sendFinish(null, res, function(err) {
        expect(err).to.have.property('message').that.equal('Something went wrong!');
        done();
      });
    });
  });

  // Express middleware

  describe('#validate', function() {
    it('returns an error if this.sendgridVerify is not set', function(done) {
      delete sendgrid.verify;

      sendgrid.validate({}, null, function(err) {
        expect(err).to.have.property('message').that.match(/sendgrid verify/);
        done();
      });
    });

    it('returns error if req.query.verify does not match this.verify', function(done) {
      sendgrid.verify = 'verify';
      var req = {
        query: {
          verify: 'something'
        },
        body: {
          left: 'yes',
          right: 'no'
        }
      };

      sendgrid.validate(req, null, function(err) {

        expect(err).to.have.property('message')
          .that.match(/not pass sendgrid validation/);

        expect(err).to.have.property('body').that.deep.equal(req.body);
        expect(err).to.have.property('query').that.deep.equal(req.query);
        expect(err).to.have.property('status', 400);
        expect(err).to.have.property('text').that.match(/sendgrid, are you?/);

        done();
      });
    });
  });

  describe('#parse', function() {
    it('returns an error if this.Busboy is not set', function(done) {
      var req = {
        headers: {}
      };

      sendgrid.parse(req, null, function(err) {
        expect(err).to.have.property('message').that.match(/options.Busboy/);
        done();
      });
    });

    it('calls next if content-type is not multipart', function(done) {
      var req = {
        headers: {}
      };
      req.headers['content-type'] = 'something else';
      sendgrid.Busboy = {};

      sendgrid.parse(req, null, function() {
        expect(arguments).to.have.length(0);
        done();
      });
    });
  });

});
