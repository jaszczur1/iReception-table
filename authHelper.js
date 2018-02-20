var credentials = {
  client: {
    id: 'abf6b137-64ce-4e62-82fb-3c07365742d0',
    secret: 'fAgsex1P99rRZKrJt6MpBsW',
    
//    id: 'e3aab124-49ec-43b0-907e-67843355dedf',
//    secret: 'gdqiqSFHRQ12398%gfUQ]%)',
//   
    
   
  },
  auth: {
    tokenHost: 'https://login.microsoftonline.com',
    authorizePath: 'common/oauth2/v2.0/authorize',
    tokenPath: 'common/oauth2/v2.0/token'
  }
};
var oauth2 = require('simple-oauth2').create(credentials);

var redirectUri = 'http://localhost:8000/authorize';

// The scopes the app requires
var scopes = [ 'openid',
               'offline_access',
               'https://outlook.office.com/mail.read',
               'https://outlook.office.com/calendars.Read',
                'https://outlook.office.com/mail.send',];

function getAuthUrl() {
  var returnVal = oauth2.authorizationCode.authorizeURL({
    redirect_uri: redirectUri,
    scope: scopes.join(' ')
  });
  console.log('Generated auth url: ' + returnVal);
  return returnVal;
}

function getTokenFromCode(auth_code, callback, response) {
  
  var token;
  oauth2.authorizationCode.getToken({
    code: auth_code,
    redirect_uri: redirectUri,
    scope: scopes.join(' ')
    }, function (error, result) {
      if (error) {
        console.log('Access token error: ', error.message);
        callback(response, error, null);
      } else {
        token = oauth2.accessToken.create(result);
        console.log('Token created: ', token.token);
        callback(response, null, token);
      }
    });
}

function refreshAccessToken(refreshToken, callback) {
  var tokenObj = oauth2.accessToken.create({refresh_token: refreshToken});
  tokenObj.refresh(callback);
}

exports.getAuthUrl = getAuthUrl;
exports.getTokenFromCode = getTokenFromCode; 
exports.refreshAccessToken = refreshAccessToken;