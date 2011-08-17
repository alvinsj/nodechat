var Pipe = require('./pipe'),
		Logger = require('./logger');

var User = require('../db/user').model,
		Session = require('../db/session').model;

exports.login = function(socket,client,request){
	if (request.username && request.password) {
		
		User.login( request.username, request.password, function(user){
			
			if(!user){
				Pipe.message(client,"<p style='color:grey'>login failed!</p>");
				return;
			}
			else{
				Session.login_session(client, user, function(login_session){
					Pipe.message(client,"<p style='color:grey'>Hi "+user.username+"!</p>");
					Pipe.broadcast(socket,"<p style='color:blue'>"+user.username+" connected!</p>");
										
					var users = [];
					Session.get_active_users(socket.clients,
						function(user){ Logger.log("whoishere result:"+JSON.stringify(user));
							if(user)
								users.push(user.username);
						},function(){
							var str = "";
							for(var i=0;i<users.length;i++) 
								str += users[i] + " ";
								Pipe.message(client,"<p style='color:grey'>"+str+" meow meow meow!<p>");
						});
				});
			}
		});
		
	}else
		Pipe.message(client,"<p style='color:grey'>Invalid credentials</p>");
};

exports.logout = function(socket,client) {
	Session.get_user_session(client,function(session){ Logger.log("Message received");
			if(session){
				Session.logout_session(client, function(res){
					Pipe.broadcast(socket,"<p style='color:red'>"+session.username+" is disconnected.</p>");
				});
			}
	});
	return;

}