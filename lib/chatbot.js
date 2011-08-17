var Pipe = require('./pipe'),
		Logger = require('./logger'),
		Lahbot = require('./lahbot');
		
var Session = require('../db/session').model,
		Chat = require('../db/chat').model;

exports.message = function(socket,client,request){
	
	// make sure user login
	Session.get_user_session(client,function(session){
		if(session){	
			// 1. recognize message command 
			switch(request.message){
				
				case "/crashnode": // to restart server
					Logger.log("crashnode");
					crashnode(socket,client,session);
					break;
				
				case "/whoishere": // to find out who are the logged in users
					Logger.log("whoishere");
					whoishere(socket,client,session);
					break;
				
				case "/logout": // to logout from the session
					Logger.log("logout");
					logout(socket,client,session);
					break;
				
				case "/get10": // get last 10 messages
					Logger.log("getting last "+10+" messages");
					get10(socket,client,session);
					break;
				
				case "/ding": // play a ding sound by audio tag
					Logger.log("play a ding");
					ding(socket,client,session);
					break;
				
				
				case "/help": // help 
					Logger.log("help docs");
					help(socket,client,session);
					break;
			
				
				default: // otherwise
					Logger.log("intelligence check");
					if(understand(socket,client,session,request) == -1){
						Chat.save_message(session.user_id, session.username+": "+request.message, function(user){
							// broadcast message to user
							Pipe.broadcast(socket,"@"+session.username+": "+request.message);
						});
					}
			}
			
		}
		// if user is not login
		else
			Pipe.message(client,"<p style='color:grey'>Please login in order to chat.</p>");
	});
}


function crashnode(socket,client,session){
	Pipe.broadcast(socket,"<p style='color:red'>@Lahbot: arghhhh you crashed me! @"+session.username+". I'll be back...</p>");
}

function whoishere(socket,client,session){
	var users = [];
	Session.get_active_users(socket.clients,function(user){
		Logger.log("whoishere result:"+JSON.stringify(user));
		if(user)
			users.push(user.username);
	},function(){
		var str = "";
		for(var i=0;i<users.length;i++) str += users[i] + " ";
		Pipe.message(client,"<p style='color:grey'>"+str+" meow meow meow!<p>");
	});
}

function logout(socket,client,session){
	Session.logout_session(client, function(res){
		Pipe.message(client,"<p style='color:grey'>you have been logged out!</p>");
	});
}

function get10(socket,client,session){
	Chat.get_last_messages(10, function(messages){
		if(messages) {
			str = "";
			for(var i=messages.length-1;i>=0;i--) 
				str += "["+JSON.stringify(messages[i].date)+"] "+messages[i].body+"><br/>";

			Pipe.message(client,"<p style='color:grey'>"+str+"</p>");
		}
	});
}

function ding(socket,client,session){
	Pipe.broadcast(socket,session.username+' (ding)!<audio src="ding.mp3" autoplay=true></audio>');
}

function help(socket,client,session){
	Pipe.message(client,"<p style='color:grey'>(@Lahbot): let @Lahbot help you!<br>/whoishere : check out who is in the chatroom<br>/get10 : get last 10 messages in chatroom<br>/ding : play the ding sound!<br>/logout : log out!<br>or message me with '@Lahbot request http://myhq.com:1020/friday'<br>to play sam's favorite friday song! cheers!</p>@Lahbot $remember [$helloworld] [Hello world!]");
}

function understand(socket,client,session,request){
	var ret = -1;
	ret = Lahbot.understand(socket,client,session,request);
	return ret;
}

