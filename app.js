var express = require('express');
var app = express();
var server = require('http').Server(app);
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var hat = require('hat');
var session = require('express-session');
var io = require('socket.io')(server);

var port = Number(process.env.PORT || 5000);
server.listen(port);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({secret: hat(), resave: false, saveUninitialized: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', function(req, res, next)
{
	if(req.path === '/')
	{
		if(req.session.loggedIn && req.cookies.token)
		{
			getUserFromToken(req.cookies.token, function(err, user)
			{
				if(!err && user)
				{
					res.redirect('/dashboard');
				}
				else
				{
					res.render('login');
				}
			});
		}
		else
		{
			res.render('login');
		}
	}
	else
	{
		next();
	}
});

app.use(function(req, res, next)
{
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function(err, req, res, next)
{
    res.status(err.status || 500);
    res.render('error',
	{
        message: err.message,
        error: {}
    });
});

console.log("Wow, such started. So port " + port + ".");

module.exports = app;
