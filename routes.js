var express = require('express'),
	// load config
	config = require('./config'),
	// socket server
	server = express.createServer( express.logger() ),
	// web server
	app = express.createServer( express.logger() );

// web server configuration
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

app.listen(config.appPort);

exports.server = server;
exports.app = app;