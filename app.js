var express = require('express');
var app = express();
var server = require('http').Server(app);
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var passhash = require('./passhash');
var hat = require('hat');
var mongojs = require('mongojs');
var db = mongojs('mongodb://35.16.18.172/wowsuchdatabase');
var session = require('express-session');
var io = require('socket.io')(server);

var port = Number(process.env.PORT || 5000);
server.listen(port);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(__dirname + '/public/img/logo/favicon.png'));
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
					res.redirect('/room');
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

app.use('/logout', function(req, res)
{
	getUserFromToken(req.cookies.token, function(err, result)
	{
		try
		{
			delete result.token;
			db.collection('users').save(result);
		} catch(e) {}
	});
	req.session.loggedIn = false;
	res.clearCookie('token');
	res.redirect('/');
});

app.use('/login', function(req, res)
{
	if(!(req.param('username') && req.param('password')))
	{
		res.send('Login failed.');
	}
	else
	{
		var users = db.collection('users');
		users.findOne({username: req.param('username'), password: passhash.hashPassword(req.param('username'), req.param('password'))}, function(err, result)
		{
			try
			{
				if(!err && result)
				{
					result.token = hat();
					users.save(result);
					res.cookie('token', result.token);
					req.session.loggedIn = true;
					res.redirect('/room');
				}
				else
				{
					throw err;
				}
			}
			catch(e)
			{
				next(e);
			}
		});
	}
});

app.use('/register', function(req, res)
{
	if(req.param('username') && req.param('password'))
	{
		db.collection('users').findOne({ username: req.param('username').toLowerCase() }, function(err, result)
		{
			if(!err && result)
			{
				res.send('That username already exists!');
			}
			else
			{
				token = hat();
				res.cookie('token', token);
				req.session.loggedIn = true;
				db.collection('users').save({
					username: req.param('username').toLowerCase(),
					password: passhash.hashPassword(req.param('username').toLowerCase(), req.param('password').toLowerCase()),
					token: token
				});
				res.redirect('/room');
			}
		});
	}
	else
	{
		res.render('register');
	}
});

app.use('/room', function(req, res)
{
	res.render('room');
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

io.sockets.on('connection', function(socket)
{
	socket.on('loginCheck', function(username, password)
	{
		db.collection('users').findOne({ username: username, password: passhash.hashPassword(username, password) }, function(err, res)
		{
			if(!err && res)
			{
				socket.emit('loginSuccess');
			}
			else
			{
				socket.emit('loginFailure', "Invalid username or password.");
			}
		});
	});
	
	socket.on('usernameCheck', function(username)
	{
		db.collection('users').findOne({token: token}, function(err, res) { socket.emit('usernameTaken', (!err && res) ? true : false)});
	});
	
	socket.on('getusername', function(token)
	{
		getUserFromToken(token, function(err, result)
		{
			if(!err && result) socket.emit('getusernameResponse', result.username);
		});
	});
});

function getUserFromToken(token, callback)
{
	db.collection('users').findOne({token: token}, function(err, res)
	{
		if(!err && res)
		{
			callback(undefined, res);
		}
		else
		{
			callback(err);
		}
	});
}

console.log("Wow, such started. So port " + port + ".");

module.exports = app;
