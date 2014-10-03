## 1.0.1 (2014-10-02)

* Properly handle connectivity/other errors thrown by `superagent` - supply [callback with arity of two](http://visionmedia.github.io/superagent/#error-handling)

## 1.0.0 (2014-09-27)

Breaking changes:

* All environment variables now prefixed with 'THEHELP_'
* Capitalized key names now required for `Twilio.send()`, happily this allows additional paramebers to be included in the request
* `Sendgrid.send()` now requires either `text` or `html` keys be provided. Similarly, means that additional parameters can be add for inclusion in the request to Sendgrid.

Other updates:

* Comprehensive testing: unit testing and manual tests for sending/receiving messages
* All test-related environment variables now prefixed with 'TEST_'
* Removed `nodemailer`, `lodash` and `winston` as dependencies
* Add support for receiving and validating incoming Sendgrid/Twilio messages
* Pare down what's in npm package
* Updated dev dependencies

## 0.1.3 (2014-03-25)

* Minor version updates: `async`, `superagent`
* Patch updates: `nodemailer`
* Updated a few dev dependencies

## 0.1.2 (2014-03-13)

* Patch updates: grunt, thehelp-core, thehelp-test
* Minor version updates: thehelp-project, nodemailer, superagent
* Fixed too-long lines after thehelp-project upgrade

## 0.1.1 (2013-12-18)

* Fixing package.json parse errors

## 0.1.0 (2013-12-14)

* Twilio and Sendgrid are functional
