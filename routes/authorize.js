var express = require('express');
var router = express.Router();
var authHelper = require('../authHelper');
var outlook = require('node-outlook');
var url = require("url");

/* GET users listing. */
router.get('/', function (request, response) {
    console.log('Request handler \'authorize\' was called.');
    var url_parts = url.parse(request.url, true);
    var code = url_parts.query.code;
    console.log('Code: ' + code);
    authHelper.getTokenFromCode(code, tokenReceived, response);

    function tokenReceived(response, error, token) {

        if (error) {

            console.log('Access token error: ', error.message);
            response.writeHead(200, {'Content-Type': 'text/html'});
            response.write('<p>ERROR: ' + error + '</p>');
            response.end();
        } else {

            getUserEmail(token.token.access_token, function (error, email) {
                if (error) {
                    console.log('getUserEmail returned an error: ' + error);
                    response.write('<p>ERROR: ' + error + '</p>');
                    response.end();
                } else if (email) {
                    var cookies = ['token=' + token.token.access_token+ ';Max-Age=4000',
                        'refresh_token=' + token.token.refresh_token+ ';Max-Age=4000',
                        'token_expires=' + token.token.expires_at.getTime()+ ';Max-Age=4000',
                        'email=' + email + ';Max-Age=4000;'];
                    response.setHeader('Set-Cookie', cookies);
                    response.writeHead(302, {'Location': 'http://localhost:8000/calendar'});
                    response.end();       
                }
            })
        }
    }
}
);
function getUserEmail(token, callback) {
    // Set the API endpoint to use the v2.0 endpoint
    outlook.base.setApiEndpoint('https://outlook.office.com/api/v2.0');
    // Set up oData parameters
    var queryParams = {
        '$select': 'DisplayName, EmailAddress',
    };
    outlook.base.getUser({token: token, odataParams: queryParams}, function (error, user) {
        if (error) {
            callback(error, null);
        } else {
            callback(null, user.EmailAddress);
        }
    });
}

module.exports = router;


