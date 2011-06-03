
// load code library
var http = require('http'),
	io = require('socket.io'),
	_ = require('./lib/underscore')._;

// load service library
var googlemaps = require('googlemaps');

// load server app library
var database = require('./database'),
	routes = require('./routes'),
	server = routes.server,
	socket = io.listen(server),
	config = require('./config'),
	logger = require('./logger');

// load server components
var	auth = require('./auth'),
	location = require('./location'),
	chat = require('./chat');

socket.on('connection',function(client){
	
	client.on('message', function(message) {
		
		logger.log("received from socket:"+message);
		
		// understand json request 
		var request = "";
		try{ request = JSON.parse(message); }
		catch(e){ logger.log("Unable to parse request: "+ message); return; }
		if(!request.command) {
			logger.log("Invalid request: "+ message);  return;
		}
		
		// handle login
		if(request.command == "login") {
			logger.log("Logging in");
			auth.login(socket,client,request);
		}
		// handle location check in
		else if(request.command == "checkin" && request.latlng ){
			logger.log("Checking in");
			location.checkin(socket,client,request);
		}
		// handle message
		else if(request.command == "message") {
			logger.log("Message received");
			chat.talk(socket,client,request);
		}
		
	});
	
	client.on('disconnect', function() { 
		// logout session when user disconnected
		database.get_user_session(client,function(session){
			if(session){
				database.logout_session(client, function(res){
					socketclient.broadcast(socket,"<p style='color:red'>"+session.username+" is disconnected.</p>");
				});
			}
		});
		return;
	});
});

// accept interrupt broadcast
server.get('/meow/:msg', function(req,res) {
	if(req.params.msg){
		logger.log(JSON.stringify(req.params.msg));
		socketclient.broadcast(socket,req.params.msg);
		res.send(JSON.stringify({status:"OK"}));
		
	}else{
		logger.log("/meow missing params");
		res.send(JSON.stringify({errors:"missing parameters"}));
	}

});

server.listen(config.serverPort);