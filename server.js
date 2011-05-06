
// load library
var http = require('http'),
	io = require('socket.io'),
	_ = require('./lib/underscore')._;

var googlemaps = require('googlemaps');

var nodechat = require('./nodechat'),
	routes = require('./routes'),
	server = routes.server,
	socket = io.listen(server),
	config = require('./config');
	
	
socket.on('connection',function(client){
	
	client.on('message', function(message) {
		console.log("Received message:"+message);
		
		// parse json request 
		var request = "";
		try{ request = JSON.parse(message); }
		catch(e){ console.log("Unable to parse request: "+ message); return; }
		
		// json request must contains command key
		if(!request.command) {console.log("Invalid request: "+ message);  return;}
		
		// handle login
		if(request.command == "login") {
			console.log("Logging in");
			if (request.username && request.password) {
				nodechat.login(request.username, request.password, function(user){
					if(!user){
						client.send("<p style='color:grey'>login failed!</p>");
						return;
					}
					else{
						nodechat.login_session(client,user, function(login_session){
							client.send("<p style='color:grey'>Hi "+user.username+"!</p>");
							socket.broadcast("<p style='color:blue'>"+user.username+" meow meow!</p>");
							console.log("show whoishere");
							var users = [];
							nodechat.get_active_users(socket.clients,function(user){
								console.log("whoishere result:"+JSON.stringify(user));
								if(user)
									users.push(user.username);
							},function(){
								var str = "";
								for(var i=0;i<users.length;i++) str += users[i] + " ";
								client.send("<p style='color:grey'>"+str+" meow meow meow!<p>");
							});
						});
					}
				});
				
			}else
				client.send("<p style='color:grey'>Invalid credentials</p>");
		
		}
		
		// handle location check in
		else if(request.command == "checkin" && request.latlng ){
			
			// make sure user already logged in
			nodechat.get_user_session(client,function(session){
				
				// allow reverse geocode and check in
				if(session) {
					
					console.log("Reversing geocode: "+request.latlng);
					googlemaps.reverseGeocode(request.latlng, function(err,data) {
						var address = data;
						address = address.results;
						address = address[0];
						address = address.formatted_address;
						socket.broadcast(session.username+" just checked in around <a target='_blank' href='http://yourphpserver.com/map.php?latlng="+request.latlng+"'>"+address+"</a>"); 
					});
					
				}
				else
					client.send("<p style='color:grey'>Please login in order to chat.</p>");
			});
			
		}
		
		// handle message
		else if(request.command == "message") {
			
			// make sure user already logged in
			nodechat.get_user_session(client,function(session){
				
				// allow messaging 
				if(session){
					
					// save every message 
					nodechat.save_message(session.user_id, session.username+": "+request.message, function(user){
						
						if(user) {
							// recognize command by message
							switch(request.message){
								// to restart server
								case "/crashnode":
									socket.broadcast("<p style='color:red'>@lahbot: arghhhh you crashed me! @"+session.username+". I'll be back...</p>");
									break;
									
								// to find out who are the logged in users
								case "/whoishere":
									console.log("whoishere");
									var users = [];
									nodechat.get_active_users(socket.clients,function(user){
										console.log("whoishere result:"+JSON.stringify(user));
										if(user)
											users.push(user.username);
									},function(){
										var str = "";
										for(var i=0;i<users.length;i++) str += users[i] + " ";
										client.send("<p style='color:grey'>"+str+" meow meow meow!<p>");
									});
									break;
									
								// to logout from the session
								case "/logout":
									nodechat.logout_session(client, function(res){
										client.send("<p style='color:grey'>you have been logged out!</p>");
									});
									break;
									
								// get last 10 messages
								case "/get10":
									console.log("getting last "+10+" messages");
								
									nodechat.get_last_messages(10, function(messages){
										if(messages) {
											str = "";
											for(var i=messages.length-1;i>=0;i--) 
												str += "["+JSON.stringify(messages[i].date)+"] "+messages[i].body+"><br/>";

											client.send("<p style='color:grey'>"+str+"</p>");
										}
									});
									break;
								
								// play a ding sound by audio tag
								case "/ding":
									socket.broadcast(session.username+' (ding)!<audio src="ding.mp3" autoplay=true></audio>');
									break;
									
								// help 
								case "/help":
									client.send("<p style='color:grey'>(@lahbot): let @lahbot help you!<br>/whoishere : check out who is in the chatroom<br>/get10 : get last 10 messages in chatroom<br>/ding : play the ding sound!<br>/logout : log out!<br>or message me with '@lahbot request http://myhq.com:1020/friday'<br>to play sam's favorite friday song! cheers!</p>");
									break;
								
								// otherwise
								default:
									
									// send request with "@lahbot request http://www.example.com:8080/talk?what=something"
									var lahbotRequest = request.message.match(/^@lahbot request http:\/\/([a-z\.]+):([0-9]+)(.*)$/);
									
									if(lahbotRequest && lahbotRequest.length==4){
										socket.broadcast("@"+session.username+": "+request.message);
										socket.broadcast("(@lahbot): @"+session.username+" ok i am sending your request!");
										
										var options = {
											host: lahbotRequest[1],
											port: lahbotRequest[2],
											path: lahbotRequest[3]
										};

										var httpget = http.get(options, function(res) {
											console.log("@lahbot sent request:");
											console.log("Got response: " + res.statusCode);
											console.log('STATUS: ' + res.statusCode);
											console.log('HEADERS: ' + JSON.stringify(res.headers));
											res.setEncoding('utf8');
											var count = 0;
											res.on('data', function (chunk) {
											    console.log('BODY: ' + chunk);
												if(count>10) return;
												socket.broadcast("(@lahbot)>@"+session.username+": nah~"+chunk);
												count++;
											});
										}).on('error', function(e) {
											console.log("Got error: " + e.message);
										});
										break;
									}
									
									// send ding sound also by recognize when user mentioned ding
									var str="";
									var m = request.message.match(/ ding/);
									if(m && m.length>0) for(var i=0;i<m.length;i++)str+='<audio src="ding.mp3" autoplay=true></audio>';
									
									// broadcast message
									socket.broadcast("@"+session.username+": "+request.message+str);
									
									// simulate @lahbot as a bot
									var callme = request.message.match(/@lahbot/);
									if(callme)
										socket.broadcast("(@lahbot): yes, what's up lah?");
									break;
							}
							
						}
						// if unable to save conversation
						else
							socket.broadcast(session.username+"(not saved): "+request.message);
					});
				}
				// if user is not login
				else
					client.send("<p style='color:grey'>Please login in order to chat.</p>");
			});	
		}
		
	});
	
	client.on('disconnect', function() { 
		
		// logout session when user disconnected
		nodechat.get_user_session(client,function(session){
			if(session){
				nodechat.logout_session(client, function(res){
					socket.broadcast("<p style='color:red'>"+session.username+" is disconnected.</p>");
				});
			}
		});
		return;
	});
});

// accept interrupt broadcast
server.get('/meow/:msg', function(req,res) {
	if(req.params.msg){
		console.log(JSON.stringify(req.params.msg));
		socket.broadcast(req.params.msg);
		res.send(JSON.stringify({status:"OK"}));
		
	}else{
		console.log("/meow missing params");
		res.send(JSON.stringify({errors:"missing parameters"}));
	}

});

server.listen(config.serverPort);