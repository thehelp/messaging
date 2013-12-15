
'use strict';

var test = require('thehelp-test');

var Twilio = require('../../../src/server/twilio');

describe('Twilio', function() {
  var twilio;

  beforeEach(function() {
    twilio = new Twilio({
      key: 'something',
      token: 'another thing',
      winston: new test.WinstonTestHelper({showLogs: false}),
    });
  });

  describe('#escapeCharacterCount', function() {
    it('return zero for normal charaters', function() {
      twilio.escapeCharacterCount('abcde').should.equal(0);
    });

    it('handles all characters requiring an escape character', function() {
      twilio.escapeCharacterCount('|^{}€[~]\\').should.equal(9);
    });
  });

  describe('#containsUnicode', function() {
    it('returns false for ASCII', function() {
      twilio.containsUnicode('abcde').should.equal(false);
    });

    it('returns true for non-ASCII', function() {
      twilio.containsUnicode('©').should.equal(true);
    });
  });

  describe('#truncateForSMS', function() {
    it('takes string down to 70 characters if it has unicode', function() {
      var text = '©2345678901234567890123456789012345678901234567890' + // 50 characters
             '123456789012345678901'; // 21 characters
      text.length.should.equal(71);
      var expected = '©2345678901234567890123456789012345678901234567890' + // 50 characters
                 '12345678901234567...'; // 20 characters

      var actual = twilio.truncateForSMS(text);
      actual.should.equal(expected);
    });

    it('takes string down to 159 characters if it has an escape character', function() {
      var text = '[2345678901234567890123456789012345678901234567890' + // 50 characters
             '12345678901234567890123456789012345678901234567890' + // 50 characters
             '12345678901234567890123456789012345678901234567890' + // 50 characters
             '1234567890'; // 10 characters
      text.length.should.equal(160);
      var expected = '[2345678901234567890123456789012345678901234567890' + // 50 characters
                 '12345678901234567890123456789012345678901234567890' + // 50 characters
                 '12345678901234567890123456789012345678901234567890' + // 50 characters
                 '123456...'; // 9 characters
      var actual = twilio.truncateForSMS(text);
      actual.should.equal(expected);
    });

    it('takes string down to 140 characters buffer is provided', function() {
      var text = '12345678901234567890123456789012345678901234567890' + // 50 characters
             '12345678901234567890123456789012345678901234567890' + // 50 characters
             '12345678901234567890123456789012345678901234567890' + // 50 characters
             '123456789012345678901234567890'; // 30 characters
      text.length.should.equal(180);
      var expected = '12345678901234567890123456789012345678901234567890' + // 50 characters
                 '12345678901234567890123456789012345678901234567890' + // 50 characters
                 '1234567890123456789012345678901234567...'; // 40 characters
      var actual = twilio.truncateForSMS(text, 20);
      actual.should.equal(expected);
    });
  });

});