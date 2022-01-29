var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const fs = require('fs').promises;

const schedule = require('node-schedule');
const rule = new schedule.RecurrenceRule();
rule.hour = 0;
rule.minute = 0;
rule.tz = 'Asia/Calcutta';

const job = schedule.scheduleJob(rule, async function () {
  let theNumbers = [];
  let n, p;
  let min = 0;
  let max = 9;
  let r = 4;

  for (let i = 0; i < r; i++) {
    do {
      n = Math.floor(Math.random() * (max - min + 1)) + min;
      p = theNumbers.includes(n);
      if (!p) {
        theNumbers.push(n);
      }
    }
    while (p);
    if (i === r - 1) {
      await fs.writeFile('theNumber.txt', theNumbers.join(''));
    }
  }
});

var indexRouter = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;