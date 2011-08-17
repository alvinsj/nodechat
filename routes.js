var express = require('express'),
		config = require('./lib/config'),
		app = express.createServer( express.logger() );

app.configure('development', function(){
	app.use(express.static(__dirname + '/public'));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  var oneYear = 31557600000;
  app.use(express.static(__dirname + '/public', { maxAge: oneYear }));
  app.use(express.errorHandler());
});

app.get('/', function(req,res) {
	res.send('hello world lah!');
});

app.get('/chat/?', function(req,res) {
	res.redirect('chat/');
});

exports.server = app;