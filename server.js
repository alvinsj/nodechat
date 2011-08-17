var Express = require('express');

var	server = Express.createServer(Express.logger()),
		socket = require('socket.io').listen(server);

var Logger = require('./lib/logger'),
		Auth = require('./lib/auth'),
		Location = require('./lib/location'),
		Chatbot = require('./lib/chatbot');

socket.on('connection',function(client){	
	// on receive message
	client.on('message', function(message) {
		
		Logger.log("Received json: "+message);
		
		// understand json 
		var request = "";
		
		try{ 
			request = JSON.parse(message); 
		}catch(e){ Logger.log("Unable to parse request: "+ message); 
			return; 
		}
		
		// command not undestandable
		if(!request.command){ Logger.log("Invalid request: "+ message);
			return;
		}
		
		// handle command: login 
		if(request.command == "login"){ Logger.log("Logging in: "+ message);
			Auth.login(socket,client,request);
		}
		// handle command: location check in 
		else if(request.command == "checkin" && request.latlng ){ Logger.log("Checking in: "+ message);
			Location.checkin(socket,client,request);
		}
		
		// handle command: message
		else if(request.command == "message"){ Logger.log("Message received: "+ message);
			Chatbot.message(socket,client,request);
		}
		
	});
	
	// on disconnection
	client.on('disconnect', function() { 
		Auth.logout(socket,client);
	});
	
});

// accept interrupt broadcast
/*server.get('/meow/:msg', function(req,res) {
	if(req.params.msg){
		Logger.log(JSON.stringify(req.params.msg));
		socketclient.broadcast(socket,req.params.msg);
		res.send(JSON.stringify({status:"OK"}));
		
	}else{
		Logger.log("/meow missing params");
		res.send(JSON.stringify({errors:"missing parameters"}));
	}

});
*/
var config = require('./lib/config');
var app = require('./routes').server;

app.listen(config.appPort);
server.listen(config.serverPort);
