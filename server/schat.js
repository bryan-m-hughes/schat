/*
The MIT License (MIT)

Copyright (c) 2014 Bryan Hughes <bryan@theoreticalideations.com> (http://theoreticalideations.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var path = require('path');
var Logger = require('transport-logger');
var UserManagement = require('user-management');
var express = require('express');
var bodyParser = require('body-parser')

module.exports = function run(options) {

  // Create the logger
  var logger;
  if (options.logFile) {
    logger = new Logger([{
      destination: options.logFile,
      minLevel: 'debug',
      timestamp: true,
      prependLevel: true
    }, {
      minLevel: 'info'
    }]);
  } else {
    logger = new Logger();
  }

  // Load user management
  var users = new UserManagement({
    database: 'schat_users'
  });
  users.load(function(err) {
    if (err) {
      throw err;
    }

    // Create the server
    var app = express();
    app.use('/', express.static(path.join(__dirname, '..', 'client-dist')));
    app.use(bodyParser.urlencoded({ extended: false }));

    // Auth endpoint
    app.post('/api/auth', function(request, response) {
      var username = request.body.username;
      var password = request.body.password;
      users.authenticateUser(username, password, function(err, result) {
        if (err) {
          response.status(500).send('internal error');
        } else if (!result.userExists || !result.passwordsMatch) {
          response.status(401).send('unauthorized');
        } else {
          response.status(200).send(result.token);
        }
      });
    });

    // Cipher check
    app.get('/api/cipher_check', function(request, response) {
      var token = request.query.token;
      users.isTokenValid(token, function(err, valid) {
        if (err) {
          response.status(500).send('internal error');
        } else if (!valid) {
          response.status(401).send('unauthorized');
        } else {
          response.status(200).send('hi');
        }
      });
    });

    // Start the server
    app.listen(options.port, '127.0.0.1');
    logger.info('Server listening on port ' + options.port);
  });
};
