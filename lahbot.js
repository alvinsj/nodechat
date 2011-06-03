var socketclient = require('./socketclient'),
	http = require('http'),
	logger = require('./logger');

var POST_REQUEST = 1001;

exports.understand = function understand(socket,client,session,request){
	
	var lahbotRequest = request.message.match(/^@lahbot request http:\/\/([a-z\.]+):([0-9]+)(.*)$/);
	var callme = request.message.match(/@lahbot/);
	if(lahbotRequest && lahbotRequest.length==4){
		return process(POST_REQUEST,socket,client,session,request);
	}else
		return -1;
}


function process(processCode,socket,client,session,request){
	switch(processCode){
		case POST_REQUEST: post_request(socket,client,session,request);
		case FRIENDLY: friendly(socket,client,session,request);
		default: return -1;
	}
	return 1;
}

function friendly(socket,client,session,request){
	// simulate @lahbot as a bot
	var callme = request.message.match(/@lahbot/);
	if(callme)
		socketclient.broadcast(socket,"(@lahbot): yes, what's up lah?");
}


// send request with "@lahbot request http://www.example.com:8080/talk?what=something"
function post_request(socket,client,session,request){
	
	var lahbotRequest = request.message.match(/^@lahbot request http:\/\/([a-z\.]+):([0-9]+)(.*)$/);
	
	if(lahbotRequest && lahbotRequest.length!=4){
		return -1;
	}
	
	socketclient.broadcast(socket,"@"+session.username+": "+request.message);
	socketclient.broadcast(socket,"(@lahbot): @"+session.username+" ok i am sending your request!");
	
	var options = {
		host: lahbotRequest[1],
		port: lahbotRequest[2],
		path: lahbotRequest[3]
	};

	var httpget = http.get(options, function(res) {
		logger.log("@lahbot sent request:");
		logger.log("Got response: " + res.statusCode);
		logger.log('STATUS: ' + res.statusCode);
		logger.log('HEADERS: ' + JSON.stringify(res.headers));
		res.setEncoding('utf8');
		var count = 0;
		res.on('data', function (chunk) {
		    logger.log('BODY: ' + chunk);
			if(count>10) return;
			socketclient.broadcast(socket,"(@lahbot)>@"+session.username+": nah~"+chunk);
			count++;
		});
	}).on('error', function(e) {
		logger.log("Got error: " + e.message);
	});
}