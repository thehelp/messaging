
'use strict';

var test = require('thehelp-test');
var expect = test.expect;

var index = require('../../../src/server/index');

describe('thehelp-twilio', function() {

  it('has property Sendgrid', function() {
    /*jshint -W030 */
    expect(index).to.have.property('Sendgrid').that.exist;
  });

  it('has property Twilio', function() {
    /*jshint -W030 */
    expect(index).to.have.property('Twilio').that.exist;
  });

});
