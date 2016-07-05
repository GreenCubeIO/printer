var express 		= require('express');
var path 			= require('path');
var favicon 		= require('serve-favicon');
var logger 			= require('morgan');
var cookieParser 	= require('cookie-parser');
var bodyParser 		= require('body-parser');
var http			= require('http');
var uuid 			= require('uuid');


GLOBAL.moment 	= require('moment');
GLOBAL._        = require('underscore');
GLOBAL.Manager  = require('./helpers/Manager.js');
GLOBAL.async    = require('async');
GLOBAL.package  = require('./package.json');
GLOBAL.Q        = require('q');




var app = express();

var session = require('express-session')

//Set port:
app.set('port', process.env.PORT || 3001);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(session({
  genid: function(req) {
    return uuid.v4()
  },
  secret: 'M0ng3',
  resave : true,
  saveUninitialized : true
}))

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/index'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {

		console.log("ERROR: " + (err.status || 500) + " | message: " + err.message);
		console.log(JSON.stringify(err.stack.split("\n")));

		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	console.log("ERROR: " + (err.status || 500) + " | message: " + err.message);
	console.log(JSON.stringify(err.stack.split("\n")));
	res.status(err.status || 500);
		res.render('error', {
		message: err.message,
		error: {}
	});
});


var server = require('http').createServer(app);
var socket = require('socket.io')(server, {
  serveClient: true
});

var server = require('http').Server(app);
GLOBAL.io = require('socket.io')(server, {
	serveClient: true
});

var printerSerialPort;


var serialPort = require("serialport");
var SerialPort = serialPort.SerialPort;
var parsers = serialPort.parsers;

serialPort.list(function (err, ports) {
	
	ports.forEach(function(port) {

		console.log(port.comName + " port.pnpId.indexOf('AL00VOSH') -> " + port.comName.indexOf('AL00VOSH'));

		if(port.comName.indexOf('TTYAMA0') > -1){

			var printerSerialPort = new SerialPort(port.comName, {
				baudrate: 19200,
				parser : parsers.readline("\n")
			});

			printerSerialPort.open(function (error) {
				if ( error ) {
					console.log('failed to open: '+error);
				} else {
					
					console.log("Serial Open");
					// printerSerialPort.on('data', process_bracelet);

				}
			});

		} else {
			console.log("port.comName: " + port.comName);
		}

		console.log(port.comName);
		console.log(port.pnpId);
		console.log(port.manufacturer);

	});
});	


io.on('connection', function (socket) {

	socket.connectDate = new Date();
	socket.ip = (socket.handshake.address) ? socket.handshake.address : null;

	socket.on('disconnect', function () {
	  console.log('[%s] %s disconnected.', new Date().toUTCString(), socket.ip);
	});


	socket.on('connection', function(socket){
		socket.emit('an event', { some: 'data' });
	});
	
	socket.on('print', function(data){

		printerSerialPort.write('GreenPOS Printer', function(err) {
			if (err) {
				return console.log('Error on write: ', err.message);
			}
			console.log('message written');
		});

	})

	socket.on('message', function (data) { 
		console.log(data + " received");
	});

	console.log('[%s] %s logged.', socket.connectDate.toUTCString(), socket.ip);

});



console.log("PORT: " + app.get('port'));

server.listen(app.get('port'), function() {
	console.log("***************************************************************".green.bold);
	console.log( package.name + " app is running at localhost:" + app.get('port'));
	console.log("***************************************************************".green.bold);
});

module.exports = app;
