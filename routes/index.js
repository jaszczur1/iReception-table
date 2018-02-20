var authHelper = require('../authHelper');

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (request, response, next ) {
    var cookies =[];
     response.cookie('Set-Cookie', cookies);
    console.log('Request handler \'home\' was called.');
  response.send('<p>Please <a href="' + authHelper.getAuthUrl() + '">sign in</a> with your Office 365 or Outlook.com account.</p>');
// next(); 
response.end();
});

module.exports = router;
