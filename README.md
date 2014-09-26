# thehelp-messaging

A lightweight package for sending SMS via Twilio, and email via Sendgrid. Also makes it easy to receive SMS and email from these services.

## Setup

First, install the project as aß dependency:

```bash
npm install thehelp-messaging --save
```

Then you'll need to provide your credentials for these services. You can do it in code, but I prefer to set it up with environment variables:

To send email, create a Sendgrid sub-user account here: <https://sendgrid.com/credentials> and use its credentials:

```
"THEHELP_SENDGRID_USERNAME": "username"
"THEHELP_SENDGRID_PASSWORD": "password"
```

To send SMS, grab your Twilio credentials: <https://www.twilio.com/user/account/settings>

```
"THEHELP_TWILIO_KEY": "your AccountSID"
"THEHELP_TWILIO_TOKEN": "your AuthToken"
```

We'll save the configuration for receiving SMS and email for a bit later.

## Usage

With that all set up, tt's as easy as this for SMS:

```
var Twilio = require('thehelp-messaging').Twilio;
var twilio = new Twilio();

var sms = {
  From: '+15551000000',
  To: '+15551000000',
  Body: 'my first text mesage!'
};

twilio.send(sms, function(err) {
  if (err) {
    throw err;
  }
});
```

`Sendgrid` is just a little more complex:

```
var Sendgrid = require('thehelp-messaging').Sendgrid;
var sendgrid = new Sendgrid();

var email = {
  from: 'someone@somewhere',
  to: 'recipient@somewhere',
  subject: 'subject!',
  body: 'Body of the message'
};

sendgrid.send(email, function(err) {
  if (err) {
    throw err;
  }
});
```

## Tests

You'll need some additional environment variables to run all tests:

```
"NOTIFY_SMS_TO": "integration tests send here",
"NOTIFY_SMS_FROM": "one of your twilio account's 'from' numbers",
"NOTIFY_EMAIL_TO": "integration tests send here",
"NOTIFY_EMAIL_FROM": "email will be 'from' this email account"
```

## History

### 0.1.3 (2014-03-25)

* Minor version updates: `async`, `superagent`
* Patch updates: `nodemailer`
* Updated a few dev dependencies

### 0.1.2 (2014-03-13)

* Patch updates: grunt, thehelp-core, thehelp-test
* Minor version updates: thehelp-project, nodemailer, superagent
* Fixed too-long lines after thehelp-project upgrade

### 0.1.1 (2013-12-18)

* Fixing package.json parse errors

### 0.1.0 (2013-12-14)

* Twilio and Sendgrid are functional

## License

(The MIT License)

Copyright (c) 2013 Scott Nonnenberg &lt;scott@nonnenberg.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
