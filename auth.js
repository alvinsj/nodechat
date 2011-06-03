var database = require('./database'),
	socketclient = require('./socketclient'),
	logger = require('./logger');

exports.login = function(socket,client,request){
	
	if (request.username && request.password) {
		
		database.login(request.username, request.password, function(user){
			if(!user){
				socketclient.message(client,"<p style='color:grey'>login failed!</p>");
				return;
			}
			else{
				database.login_session(client, user, function(login_session){
					socketclient.message(client,"<p style='color:grey'>Hi "+user.username+"!</p>");
					
					socketclient.broadcast(socket,"<p style='color:blue'>"+user.username+" meow meow!</p>");
					
					logger.log("show whoishere");
					
					var users = [];
					database.get_active_users(socket.clients,
						function(user){
							logger.log("whoishere result:"+JSON.stringify(user));
							if(user)
								users.push(user.username);
						},function(){
							var str = "";
							for(var i=0;i<users.length;i++) 
								str += users[i] + " ";
								socketclient.message(client,"<p style='color:grey'>"+str+" meow meow meow!<p>");
						});
				});
			}
		});
		
	}else
		socketclient.message(client,"<p style='color:grey'>Invalid credentials</p>");
}