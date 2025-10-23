var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cron = require('./cron');

var indexRouter = require('./routes/index');
var tempRouter = require('./routes/temps');
var widgetRouter = require('./routes/widget');
var sensorTypeRouter = require('./routes/forms/frm_sensorType');
var roomRouter = require('./routes/forms/frm_room');
var api = require('./routes/api/handleDatabaseCalls');
var mirror_Router = require('./routes/mirror');
var app = express();

// REGISTER CRON JOBS
//cron.saveTemp.start();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Routes setup
app.use('/', indexRouter);
app.use('/temp', tempRouter);
app.use('/wg_temp', widgetRouter);
app.use('/frm_sensorType', sensorTypeRouter);
app.use('/frm_room', roomRouter);
app.use('/api', api);
app.use('/mirror', mirror_Router);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
