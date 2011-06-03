var database = require('./database'),
	socketclient = require('./socketclient'),
	logger = require('./logger');

var lahbot = require('./lahbot');

function crashnode(socket,client,session){
	socketclient.broadcast(socket,"<p style='color:red'>@lahbot: arghhhh you crashed me! @"+session.username+". I'll be back...</p>");
}

function whoishere(socket,client,session){
	var users = [];
	database.get_active_users(socket.clients,function(user){
		logger.log("whoishere result:"+JSON.stringify(user));
		if(user)
			users.push(user.username);
	},function(){
		var str = "";
		for(var i=0;i<users.length;i++) str += users[i] + " ";
		socketclient.message(client,"<p style='color:grey'>"+str+" meow meow meow!<p>");
	});
}

function logout(socket,client,session){
	database.logout_session(client, function(res){
		socketclient.message(client,"<p style='color:grey'>you have been logged out!</p>");
	});
}

function get10(socket,client,session){
	database.get_last_messages(10, function(messages){
		if(messages) {
			str = "";
			for(var i=messages.length-1;i>=0;i--) 
				str += "["+JSON.stringify(messages[i].date)+"] "+messages[i].body+"><br/>";

			socketclient.message(client,"<p style='color:grey'>"+str+"</p>");
		}
	});
}

function ding(socket,client,session){
	socketclient.broadcast(socket,session.username+' (ding)!<audio src="ding.mp3" autoplay=true></audio>');
}

function help(socket,client,session){
	socketclient.message(client,"<p style='color:grey'>(@lahbot): let @lahbot help you!<br>/whoishere : check out who is in the chatroom<br>/get10 : get last 10 messages in chatroom<br>/ding : play the ding sound!<br>/logout : log out!<br>or message me with '@lahbot request http://myhq.com:1020/friday'<br>to play sam's favorite friday song! cheers!</p>");
}

function understand(socket,client,session,request){
	
	var ret = -1;
	ret = lahbot.understand(socket,client,session,request);
		
	return ret;
}

exports.talk = function(socket,client,request){
	// make sure user already logged in
	database.get_user_session(client,function(session){
		
		// allow messaging 
		if(session){
			
			// save every message 
			database.save_message(session.user_id, session.username+": "+request.message, function(user){
				
				if(user) {
					// recognize command by message
					switch(request.message){
						// to restart server
						case "/crashnode":
							logger.log("crashnode");
							crashnode(socket,client,session);
							break;
							
						// to find out who are the logged in users
						case "/whoishere":
							logger.log("whoishere");
							whoishere(socket,client,session);
							break;
							
						// to logout from the session
						case "/logout":
							logger.log("logout");
							logout(socket,client,session);
							break;
							
						// get last 10 messages
						case "/get10":
							logger.log("getting last "+10+" messages");
							get10(socket,client,session);
							break;
						
						// play a ding sound by audio tag
						case "/ding":
							logger.log("play a ding");
							ding(socket,client,session);
							break;
							
						// help 
						case "/help":
							logger.log("help docs");
							help(socket,client,session);
							break;
						
						// otherwise
						default:
							logger.log("intelligence check");
							if(understand(socket,client,session,request) == -1){
								socketclient.broadcast(socket,"@"+session.username+": "+request.message);
							}
					}
					
				}
				// if unable to save conversation
				else
					socketclient.broadcast(socket,session.username+"(not saved): "+request.message);
			});
		}
		// if user is not login
		else
			socketclient.message(client,"<p style='color:grey'>Please login in order to chat.</p>");
	});
}