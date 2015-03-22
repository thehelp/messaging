
'use strict';

var test = require('thehelp-test');
var expect = test.expect;
var sinon = test.sinon;

var Twilio = require('../../../src/server/twilio');

describe('Twilio', function() {
  var twilio, key, token;

  beforeEach(function() {
    var key, token;

    key = process.env.THEHELP_TWILIO_KEY;
    token = process.env.THEHELP_TWILIO_TOKEN;

    twilio = new Twilio({
      key: 'something',
      token: 'another thing'
    });
  });

  afterEach(function() {
    process.env.THEHELP_TWILIO_KEY = key;
    process.env.THEHELP_TWILIO_TOKEN = token;
  });

  describe('constructor', function() {
    /*jshint nonew: false */

    it('throws if THEHELP_TWILIO_KEY is not defined', function() {
      delete process.env.THEHELP_TWILIO_KEY;

      expect(function() {
        new Twilio();
      }).to['throw']().that.match(/twilio key/);
    });

    it('does not throw if key param is provided', function() {
      delete process.env.THEHELP_TWILIO_KEY;

      expect(function() {
        new Twilio({
          key: 'something'
        });
      }).not.to['throw']();
    });

    it('throws if THEHELP_TWILIO_TOKEN is not defined', function() {
      delete process.env.THEHELP_TWILIO_TOKEN;

      expect(function() {
        new Twilio();
      }).to['throw']().that.match(/twilio token/);
    });

    it('does not throw if token param is provided', function() {
      delete process.env.THEHELP_TWILIO_TOKEN;

      expect(function() {
        new Twilio({
          token: 'something'
        });
      }).not.to['throw']();
    });
  });

  // Sending SMS

  describe('#send', function() {
    it('returns error if To is not provided', function(done) {
      var email = {
        From: 'from',
        Body: 'body'
      };

      twilio.send(email, function(err) {
        expect(err).to.have.property('message').that.match(/options.To/);
        done();
      });
    });

    it('returns error if From is not provided', function(done) {
      var email = {
        To: 'to',
        Body: 'body'
      };

      twilio.send(email, function(err) {
        expect(err).to.have.property('message').that.match(/options.From/);
        done();
      });
    });

    it('returns error if Body is not provided', function(done) {
      var email = {
        To: 'to',
        From: 'from'
      };

      twilio.send(email, function(err) {
        expect(err).to.have.property('message').that.match(/options.Body/);
        done();
      });
    });
  });

  describe('#_sendFinish', function() {
    it('returns error if error is provided, null res', function(done) {
      var expected = new Error('superagent error');
      twilio._sendFinish(expected, null, null, function(err) {
        expect(err).to.have.property('message', expected.message);

        done();
      });
    });

    it('updates error message if body.detail', function(done) {
      var response = 'error from twilio';

      var err = new Error('original');
      var res = {
        status: 400,
        body: {
          detail: response
        }
      };
      var options = {
        To: 'blah',
        From: 'blah',
        Body: 'something'
      };

      twilio._sendFinish(err, res, options, function(err) {
        expect(err).to.have.property('message').that.equal('original - ' + response);
        expect(err).to.have.property('options').that.deep.equal(options);
        expect(err).not.to.have.property('response');

        done();
      });
    });
  });

  // SMS Processing

  describe('#truncate', function() {
    it('takes string down to 70 characters if it has unicode', function() {
      var text = '©2345678901234567890123456789012345678901234567890' + // 50 chars
             '123456789012345678901'; // 21 chars
      expect(text).to.have.length(71);
      var expected = '©2345678901234567890123456789012345678901234567890' + // 50 chars
                 '12345678901234567...'; // 20 chars

      var actual = twilio.truncate(text);
      expect(actual).to.equal(expected);
    });

    it('takes string down to 159 chars if it has an escape character', function() {
      var text = '[2345678901234567890123456789012345678901234567890' + // 50 chars
             '12345678901234567890123456789012345678901234567890' + // 50 chars
             '12345678901234567890123456789012345678901234567890' + // 50 chars
             '1234567890'; // 10 chars
      expect(text).to.have.length(160);
      var expected = '[2345678901234567890123456789012345678901234567890' + // 50 chars
                 '12345678901234567890123456789012345678901234567890' + // 50 chars
                 '12345678901234567890123456789012345678901234567890' + // 50 chars
                 '123456...'; // 9 chars
      var actual = twilio.truncate(text);
      expect(actual).to.equal(expected);
    });

    it('takes string down to 140 chars buffer is provided', function() {
      var text = '12345678901234567890123456789012345678901234567890' + // 50 chars
             '12345678901234567890123456789012345678901234567890' + // 50 chars
             '12345678901234567890123456789012345678901234567890' + // 50 chars
             '123456789012345678901234567890'; // 30 chars
      expect(text).to.have.length(180);
      var expected = '12345678901234567890123456789012345678901234567890' + // 50 chars
                 '12345678901234567890123456789012345678901234567890' + // 50 chars
                 '1234567890123456789012345678901234567...'; // 40 chars
      var actual = twilio.truncate(text, 20);
      expect(actual).to.equal(expected);
    });
  });

  describe('#escapeCharacterCount', function() {
    it('return zero for normal charaters', function() {
      expect(twilio.escapeCharacterCount('abcde')).to.equal(0);
    });

    it('handles all characters requiring an escape character', function() {
      expect(twilio.escapeCharacterCount('|^{}€[~]\\')).to.equal(9);
    });
  });

  describe('#containsUnicode', function() {
    it('returns false for ASCII', function() {
      expect(twilio.containsUnicode('abcde')).to.equal(false);
    });

    it('returns true for non-ASCII', function() {
      expect(twilio.containsUnicode('©')).to.equal(true);
    });
  });

  describe('#_truncate', function() {
    it('handles strings right at the limit', function() {
      expect(twilio._truncate(5, 'abcde')).to.equal('abcde');
    });

    it('handles strings smaller than the limit', function() {
      expect(twilio._truncate(5, 'abcd')).to.equal('abcd');
    });

    it('strings over the limit', function() {
      expect(twilio._truncate(5, 'abcdefgh')).to.equal('ab...');
    });

    it('strings just a little over the limit', function() {
      expect(twilio._truncate(5, 'abcdef')).to.equal('ab...');
    });
  });

  // Express middleware

  describe('#validate', function() {
    it('returns an error if this.twilio is not set', function(done) {
      delete twilio.twilio;

      twilio.validate({}, null, function(err) {
        expect(err).to.have.property('message').that.match(/options.twilio/);
        done();
      });
    });

    it('returns error if twilio.validateExpressRequest returns false', function(done) {
      twilio.twilio = {
        validateExpressRequest: sinon.stub().returns(false)
      };
      var req = {
        body: {
          From: 'from',
          To: 'to'
        }
      };

      twilio.validate(req, null, function(err) {

        expect(twilio).to.have
          .deep.property('twilio.validateExpressRequest.callCount', 1);

        expect(err).to.have.property('message').that.match(/not pass twilio validation/);
        expect(err).to.have.property('body').that.deep.equal(req.body);
        expect(err).to.have.property('status', 400);
        expect(err).to.have.property('text').that.match(/twilio, are you?/);

        done();
      });
    });

    it('does not call validateExpressRequest if development set to true', function(done) {
      twilio.twilio = {
        validateExpressRequest: sinon.stub().returns(false)
      };
      twilio.development = true;

      twilio.validate({}, null, function(err) {

        expect(twilio).to.have
          .deep.property('twilio.validateExpressRequest.callCount', 0);

        expect(err).not.to.exist;

        done();
      });
    });
  });

});
