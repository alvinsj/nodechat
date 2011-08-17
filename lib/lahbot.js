var http = require('http');

var Pipe = require('./pipe'),
		Logger = require('./logger'),
		Chatbot = require('./chatbot'),
		Config = require('./config');
	
var Lahbot = require('../db/lahbot'),
		Sessions = require('../db/session');

exports.understand = function understand(socket,client,session,request){
	var res = -1;
	res = res==1?1:post_request(socket,client,session,request);
	res = res==1?1:ding(socket,client,session,request);
	res = res==1?1:remember(socket,client,session,request);
	res = res==1?1:do_something(socket,client,session,request);
	res = res==1?1:friendly(socket,client,session,request);
	res = res==1?1:mention(socket,client,session,request);
	return res;
}

function friendly(socket,client,session,request){
	// simulate @lahbot as a bot
	var callme = request.message.match(/@lahbot/);
	if(callme){		
		Pipe.broadcast(socket,"(@lahbot): yes, what's up lah?");
		return 1;	
	}else
		return -1;
	
}

// send request with "@lahbot request http://www.example.com:8080/talk?what=something"
function post_request(socket,client,session,request){
	
	var lahbotRequest = request.message.match(/^@lahbot request http:\/\/([a-z\.]+):([0-9]+)(.*)$/);
	
	if(lahbotRequest && lahbotRequest.length==4){
		Pipe.message(client,"@"+session.username+": "+request.message);
		Pipe.message(client,"(@lahbot): @"+session.username+" ok i am sending your request!");
	
		var options = {
			host: lahbotRequest[1],
			port: lahbotRequest[2],
			path: lahbotRequest[3]
		};

		var httpget = http.get(options, function(res) {
			Logger.log("@lahbot sent request:");
			Logger.log("Got response: " + res.statusCode);
			Logger.log('STATUS: ' + res.statusCode);
			Logger.log('HEADERS: ' + JSON.stringify(res.headers));
			res.setEncoding('utf8');
			var count = 0;
			res.on('data', function (chunk) {
			    Logger.log('BODY: ' + chunk);
				if(count>10) return;
				Pipe.message(client,"(@lahbot)>@"+session.username+": nah~"+chunk);
				count++;
			});
		}).on('error', function(e) {
			Logger.log("Got error: " + e.message);
		});
		return 1;
	}else
		return -1;
}

// @lahbot 

// @lahbot $remember $command message
function remember(socket,client,session,request){
	var remember = request.message.match(/@lahbot \$remember \[\$([\s\S]*)\] \[([\s\S]*)\]/);
	if(remember && remember.length==3){
		user_id = session.user_id;
		command = remember[1];
		message = remember[2];
		
		var test = message.match(/@lahbot \$remember \[\$([\s\S]*)\] \[([\s\S]*)\]/);
		if(test && test.length==3) // prevent infinite loop
			Pipe.message(client, "(@lahbot): error saving command. endless loop");
		
		Lahbot.lahbot_command(command,function(result){
			if(result){
				Pipe.message(client, "(@lahbot): unable to remember, same command existed");
			}else{
				Lahbot.lahbot_remember(user_id, command, message, "public", function(result){
					if(result)
						Pipe.message(client, "(@lahbot): command saved");
					else
						Pipe.message(client, "(@lahbot): error saving command");
					
				});
			}
		});
		return 1;
	}else
		return -1;
}

function do_something(socket,client,session,request){
	var do_something = request.message.match(/@lahbot \$([\s\S]*)/);
	if(do_something && do_something.length==2){
		command = do_something[1];
		Lahbot.lahbot_command(command, function(doc){
			if(doc){
				request = new Object;
				request.command = "message";
				request.message = doc.message;
				Chatbot.message(socket,client,request);
			}else
				Pipe.message(client, "(@lahbot): command not found/valid");
		});
		return 1;
	}else
		return -1;
}

function ding(socket,client,session,request){
	var ding = request.message.match(/@lahbot ding @([\s\S]*)/);
	if(ding && ding.length==2){
		request = new Object;
		request.command = "message";
		request.message = "@lahbot request "+Config.push_notify_url(ding[1],session.username+" ding u!");
		Chatbot.message(socket,client,request);
		return 1;
	}else
		return -1;
}

function mention(socket,client,session,request){
	var mention = request.message.match(/.*?@([\S]+)[ ]?.*?/);
	if(mention && mention.length==2){
		Pipe.broadcast(socket,"@"+session.username+": "+request.message);
		var users = [];
		Session.get_active_users(socket.clients,function(user){
			if(user)
				users.push(user.username);
		},function(){
			var around =false;
			for(var i=0;i<users.length;i++){
				if(users[i]==mention[1])
					around=true;
			}

			if(around)
				return;
			else{
				var msg = request.message;
				request = new Object;
				request.command = "message";
				request.message = "@lahbot request "+Config.push_notify_url(mention[1],"@"+session.username+": "+msg);
				Chatbot.message(socket,client,request);
			}
		});
		return 1;
	}else
		return -1;
}
