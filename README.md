# thehelp-messaging

Wrappers for messaging-related APIs. For now, Twilio and Sendgrid.

## Setup

To use the `Sendgrid` class, you'll need these two environment variables set:

    "SENDGRID_USERNAME": "username"
    "SENDGRID_PASSWORD": "raw password, unfortunately"

To use the `Twilio` class, you'll need these two environment variables:

    "TWILIO_KEY": "'Account SID' on your account detail page"
    "TWILIO_TOKEN": "your 'Auth Token' on that same page"

## Usage

It's as easy as this for `Twilio`:

    var Twilio = require('thehelp-messaging').Twilio;
    var twilio = new Twilio();
    var text = {
      from: '+1 5551000000',
      to: '+1 5551000000',
      body: 'my first text mesage!'
    };

    twilio.send(text, function(err) {
      if (err) {
        throw err;
      }
    });

`Sendgrid` is just a little more complex:

    var Sendgrid = require('thehelp-messaging').Sendgrid;
    var sendgrid = new Sendgrid();
    var email = {
      from: 'Someone <someone@somewhere>',
      to: 'recipient@somewhere',
      subject: 'subject!',
      body: 'Body of the message'
    };

    sendgrid.send(email, function(err) {
      if (err) {
        throw err;
      }
    });

## Tests

You'll need some additional environment variables to run all tests:

    "NOTIFY_SMS_TO": "integration tests send here",
    "NOTIFY_SMS_FROM": "one of your twilio account's 'from' numbers",
    "NOTIFY_EMAIL_TO": "integration tests send here",
    "NOTIFY_EMAIL_FROM": "email will be 'from' this email account"

## History

### 0.1.0

+ Twilio and Sendgrid are functional

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
