// const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');

const usersRouter = require('./routes/users');
const apiRouter = require('./routes/api');
const adminRouter = require('./routes/admin');
const deeplinkRouter = require('./routes/deeplink');
const icsRouter = require('./routes/ics');

const {query} = require("./utils/db");

const http_app = express();
http_app.use(function (req, res) {
	console.log("Redirecting to https " + "https://" + req.headers.host + req.url)
	res.redirect('https://' + req.headers.host + req.url);
});

const app = express();

let sessionConfig = {
	secret: "gUMc1hBVlY",
	saveUninitialized: true,
	cookie: {maxAge: 1000 * 60 * 60 * 24},
	resave: false
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session(sessionConfig));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', usersRouter);
app.use('/api', apiRouter);
app.use('/admin', adminRouter);
app.use('/deeplink', deeplinkRouter);
app.use('/ics', icsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	res.status(404).send("Error 404");
});

// error handler
// app.use(function (err, req, res, next) {
// 	// set locals, only providing error in development
// 	res.locals.message = err.message;
// 	res.locals.error = req.app.get('env') === 'development' ? err : {};
//
// 	// render the error page
// 	res.status(err.status || 500);
// 	res.render('error');
// });

module.exports = {
	app: app,
	http_app: http_app
};
