var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));

app.use('/',express.static(path.join(__dirname, '/public/')));
app.use('/',express.static(path.join(__dirname, '/node_modules/')));
app.use('/',express.static(path.join(__dirname, '/public/aaLibary')));


var index = require('./routes/index');
var authorize = require('./routes/authorize');
var getToken = require('./routes/getToken');
var calendar = require('./routes/calendar');
var room1 = require('./routes/room1');
var room2 = require('./routes/room2');
var room3 = require('./routes/videoConf');

app.use('/', index);
app.use('/authorize', authorize);
app.use('/getToken', getToken);
app.use('/calendar', calendar);
app.use('/room1', room1);
app.use('/room2', room2);
app.use('/conference', room3);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
