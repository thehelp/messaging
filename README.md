# thehelp-messaging

A lightweight package for sending SMS via [Twilio](https://www.twilio.com), and email via [Sendgrid](http://sendgrid.com/). Also makes it easy to receive SMS and email from these services in [`express`](http://expressjs.com/)-based apps.


## Setup

First, install the project as a dependency:

```bash
npm install thehelp-messaging --save
```

Then you'll need to provide your credentials for these services. You can do it in code, but I prefer to set it up with environment variables...

### Email via Sendgrid

[Create a Sendgrid sub-user account](https://sendgrid.com/credentials) and use its credentials:

```json
{
  "THEHELP_SENDGRID_USERNAME": "username",
  "THEHELP_SENDGRID_PASSWORD": "password"
}
```

### SMS via Twilio

Grab your Twilio API keys from your [account settings page](https://www.twilio.com/user/account/settings):

```json
{
  "THEHELP_TWILIO_KEY": "your AccountSID",
  "THEHELP_TWILIO_TOKEN": "your AuthToken"
}
```

We'll save the configuration for __receiving__ SMS and email for a bit later.


## Sending messages

With that all set up, it's as easy as this:

### Send email

```javascript
var Sendgrid = require('thehelp-messaging').Sendgrid;
var sendgrid = new Sendgrid();

var email = {
  from: 'someone@somewhere',
  to: 'recipient@somewhere',
  subject: 'subject!',

  // this or html is required
  text: 'Plaintext message body',

  // optional
  fromname: 'User Name'
};

sendgrid.send(email, function(err) {
  if (err) {
    throw err;
  }
});
```

[Detailed API documentation](https://sendgrid.com/docs/API_Reference/Web_API/mail.html).

## Send SMS

```javascript
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

Yep, those key names are all capitalized. :0(
[Detailed API documentation](https://www.twilio.com/docs/api/rest/sending-sms).


## Receiving messages

This project includes some `express` middleware helpers for receiving SMS from Twilio and Email from Sendgrid.

### Receive mail

You'll need one new environment variable:

```json
{
  "THEHELP_SENDGRID_VERIFY": "a hard-to-guess value",
}
```

And you'll need to download and install the [`busboy`](https://www.npmjs.org/package/busboy) node module and (1.2.9 recommended) supply it to the `Sendgrid` class on construction:

```javascript
var express = require('express');
var Busboy = require('busboy');
var Sendgrid = require('thehelp-messaging').Sendgrid;

var app = express();
var sendgrid = new Sendgrid({
  Busboy: Busboy
});

app.post('/sendgrid/email', sendgrid.validate, sendgrid.parse, function(req, res) {
  console.log('email:', req.body);
  res.end();
});
```

[`validate`](LINK TO DEEP DOCS) will ensure that the message is really from Sendgrid (via the 'verify' querystrying parameter and your environment variable. [`parse`](LINK TO DEEP DOCS) will use `busboy` to parse out all the non-file components sent by Sendgrid.

Now you just need to set up the [Sengrid Parse dashboard](https://sendgrid.com/developer/reply) to point a given email subdomain of your site to your server. This is kind of a pain to test by deploying to your server all the time, so check out [ngrok](https://ngrok.com/) for exposing a port on your machine to the outside world.

### Receive SMS

Twilio messages are easier to deal with, because they're more easily parsed. However, you still have the problem of ensuring that the message is really from Twilio. That's where `twilio.validate()` comes in - note the new node modules required:

```javascript
var express = require('express');
var bodyPraser = require('body-parser');
var twilioSdk = require('twilio');
var Twilio = require('thehelp-messaging').Twilio;

var app = express();
var twilio = new Twilio({
  twilio: twilioSdk
});

app.post('/twilio/sms', bodyParser.urlencoded(), twilio.validate, function(req, res) {
  console.log('sms:', req.body);
  res.end();
});
```

Now you need to buy a phone number on Twilio and [have it forward SMS sent to it to your application](https://www.twilio.com/user/account/phone-numbers/incoming). Again, check out [ngrok](https://ngrok.com/) for exposing a port on your machine to the outside world. It makes iterating on your SMS setup that much faster.

There are a few additional troublshooting tips in the [`Twilio.validate` detailed documentation.](LINK TO DEEP DOCS).

## Contributing changes

It's a pretty involved project. You'll need Sendgrid and Twilio accounts, and all the environment variables mentioned above.

### Running tests

The unit tests are quick and easy, but the manual tests (not part of the `grunt` 'default' task) in this project are pretty involved. They:

  1) send SMS and email to a phone number and email address for manual verification, and
  2) send SMS and email and then receive those messages programmatically

You'll need some additional environment variables:

```json
{
  "TEST_EMAIL_FROM": "who the emails will be from",
  "TEST_SMS_FROM": "an SMS-capable phone number you own on Twilio",

  "TEST_EMAIL_MANUAL_RECEIVE": "where you'll get emails for manual verify",
  "TEST_SMS_MANUAL_RECEIVE": "where you'll get SMS for manual verify",

  "TEST_EMAIL_RECEIVE": "email set up for receive by Sendgrid",
  "TEST_SMS_RECEIVE": "an SMS-capable phone number you own on Twilio"
}
```

Those last two environment variables are where things get really interesting. You'll need to set up Sendgrid and Twilio to forward messages to your machine. See the 'Receiving messages' section above.

### Pull requests

When you have some changes ready, please include:

* Justification - why is this change worthwhile? Link to issues, use code samples, etc.
* Documentation changes for your code updates. Be sure to check the groc-generated HTML with `grunt doc`
* A description of how you tested the change. Don't forget about the very-useful `npm link` command :0)

I may ask you to use a `git rebase` to ensure that your commits are not interleaved with commits already in the history. And of course, make sure `grunt` completes successfully (take a look at the requirements for [`thehelp-project`](https://github.com/thehelp/project)). :0)


## Detailed Documentation

Detailed docs be found at this project's GitHub Pages, thanks to `groc`: <http://thehelp.github.io/messaging>


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
