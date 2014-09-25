
'use strict';

var test = require('thehelp-test');
var expect = test.expect;

var Twilio = require('../../../src/server/twilio');

describe('Twilio', function() {
  var twilio;

  beforeEach(function() {
    twilio = new Twilio({
      key: 'something',
      token: 'another thing'
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

  describe('#truncateForSMS', function() {
    it('takes string down to 70 characters if it has unicode', function() {
      var text = '©2345678901234567890123456789012345678901234567890' + // 50 chars
             '123456789012345678901'; // 21 chars
      expect(text).to.have.length(71);
      var expected = '©2345678901234567890123456789012345678901234567890' + // 50 chars
                 '12345678901234567...'; // 20 chars

      var actual = twilio.truncateForSMS(text);
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
      var actual = twilio.truncateForSMS(text);
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
      var actual = twilio.truncateForSMS(text, 20);
      expect(actual).to.equal(expected);
    });
  });

});
