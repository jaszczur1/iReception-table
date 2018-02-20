var outlook = require('node-outlook');
var authHelper = require('../authHelper');
outlook.base.setApiEndpoint('https://outlook.office.com/api/v2.0');

var getActualTime = require('../node_modules/moment'); //lib for format time

var express = require('express');
var router = express.Router();

var token;
var expiration;
var refresh_token;
var token_refreh_pom;
var bool = true;
// czy wystpił bład do wypisania na ekranie głownym
var Verror = "ok";
//ilość błędów
var amoutErrors = 0;

router.get('/', function (request, response, next) {

    console.log('Request handler token  was called.');
    //get cookies from page
    if (bool) {
        token = request.cookies.token;
        expiration = new Date(parseFloat(request.cookies.token_expires));
        refresh_token = request.cookies.refresh_token;
        console.log("Get request all cookies :" + request.headers.cookie);
        console.log("work with this mail: " + request.cookies.email);
        bool = false;
    }

    if (Verror !== "ok") {
        //    response.send("podczas pracy wystapił błąd sieci lub brak sieci");

        var json = JSON.stringify({
            "message": "error"
        });
        response.json(json);
        // amoutErrors = 0;
    }

    getAccessToken(request, response, function (error, refershTokenPom) {

        if (error) {
            // ile błędów
            amoutErrors++;
            console.log(amoutErrors);

            if (amoutErrors > 50) {
                Verror = error;
            } else {

                console.log("bład tokena do obsłuzenia");
                refresh_token = refershTokenPom;
            }
        }
    });

    function getAccessToken(request, response, callback) {

        console.log("czaswygasniecia : " + expiration);
        console.log("aktualny czas : " + new Date());

        // refresh token
        if (expiration <= new Date()) {
            console.log('TOKEN EXPIRED, REFRESHING');
            authHelper.refreshAccessToken(refresh_token, function (error, newToken) {

                if (error) {
                    console.log('bład nowego tokena: ' + error);
                    callback(error, token_refreh_pom);

                } else if (newToken) {

                    console.log(newToken);
                    Verror = "ok";
                    amoutErrors = 0;

                    if (token !== newToken.token.access_token) {
                        console.log("nowy glowny token");
                    }
                    if (refresh_token !== newToken.token.refresh_token) {
                        console.log("nowy refresh token");
                    }
                    token = newToken.token.access_token;
                    expiration = newToken.token.expires_at;
                    expiration = new Date(expiration);
                    console.log(expiration);

                    // jesli czas sie skończy to użyj tego
                    token_refreh_pom = newToken.token.refresh_token;
                }
            })
        } else {
            console.log("token aktualny");

        }
        try {
            response.end();
        } catch (e) {

        }
    }

});

router.get('/mail', function (request, response, next) {

    console.log('try send msg');
//    console.log(request.param);

  
    var host = request.param('host');
    var message = request.param('message');
    var titleEventObiect = request.param('titleEventObiect');

    console.log('uzywam tego token    ' + token);

    var newMsg = {
        Subject: titleEventObiect,
        Importance: 'Low',
        Body: {
            ContentType: 'HTML',
            Content: message,
        },
        ToRecipients: [
            {
                EmailAddress: {
                    Address: host
                }
            }
        ]
    };

// Pass the user's email address
    var userInfo = {
        email: 'APSC.iReception@advantech.com'
    };

    outlook.mail.sendNewMessage({token: token, message: newMsg, user: userInfo},
            function (error, result) {

                if (error) {
                    console.log('sendNewMessage returned an error: ' + error);

                    // Verror = error;
                    response.status(500).send();

                } else if (result) {
                    console.log(result);
                    var json1 = JSON.stringify({
                        "message": "mail  wyslany"
                    });
                    Verror = "ok";
                    response.json(json1);
                }
            });
}
);
router.get('/getCalendarFromEvent', function (request, response, next) {

    var userInfo = {
        email: 'APSC.iReception@advantech.com'
    };

    var startDateTime = getActualTime().format("YYYY-M-D");
    var endDateTime = getActualTime().add(1, 'day');
    endDateTime = getActualTime(endDateTime).format("YYYY-M-D");

    console.log("get event for day " + startDateTime + " -" + endDateTime);

    var apiOptions = {
        token: token,
        // If none specified, the Primary calendar will be used
        user: userInfo,
        startDatetime: startDateTime,
        endDatetime: endDateTime
    };

    outlook.calendar.syncEvents(apiOptions, function (error, events) {
        if (error) {
            console.log('syncEvents returned an error:', error);
            response.status(500).send();


        } else {

            try {
        
                response.json(events);
                console.log(events);
                console.log(events.value[0].Start);
                console.log(events.value[0].End);
//                console.log(events.value[0].Location);
//                console.log(events.value[0].Organizer.EmailAddress.Address);
//                console.log(events.value[0].Organizer.EmailAddress.Name);
//                console.log(events.value[0].Subject);
//                console.log('/////////////////////////////////////////////////////');

            } catch (e) {
                console.log("brak zdarzen w kalenarzu " + e)
            }

//             Do something with the events.value array
//             Then get the @odata.deltaLink
//              var delta = messages['@odata.deltaLink'];
//
//             Handle deltaLink value appropriately:
//             In general, if the deltaLink has a $skiptoken, that means there are more
//             "pages" in the sync results, you should call syncEvents again, passing
//             the $skiptoken value in the apiOptions.skipToken. If on the other hand,
//             the deltaLink has a $deltatoken, that means the sync is complete, and you should
//             store the $deltatoken value for future syncs.
//            
//             The one exception to this rule is on the intial sync (when you call with no skip or delta tokens).
//             In this case you always get a $deltatoken back, even if there are more results. In this case, you should
//             immediately call syncMessages again, passing the $deltatoken value in apiOptions.deltaToken.
        }
    });
});

//https://github.com/jasonjoh/node-outlook/blob/master/reference/node-outlook.md
// instrukcja jest takze node_modules

module.exports = router;