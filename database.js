var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId,
	_ = require('./lib/underscore')._,
	logger = require('./logger');

mongoose.connect('mongodb://localhost/nodechat');
var Message = new Schema({
	date: Date,
	body: String,
	type: String
});

var Conversation = new Schema({
	date: Date,
	body: String,
	user_id: String,
	username: String
});
	
var User = new Schema({
	username:String,
	password:String,
	messages : [Message]
});

var UserSession = new Schema({
	session:String,
	username:String,
	user_id:String,
	valid:Boolean
});

var LahbotMemory = new Schema({
	user_id:String,
	command:String,
	message:String,
	mode:String
});

mongoose.model('User',User);
mongoose.model('UserSession', UserSession);
mongoose.model('Conversation', Conversation);
mongoose.model('LahbotMemory', LahbotMemory);

exports.db = mongoose;

var Conversation = mongoose.model('Conversation');
var User = mongoose.model('User');
var UserSession = mongoose.model('UserSession');
var LahbotMemory = mongoose.model('LahbotMemory');

function login(username,password,callback) {
	User.findOne({username:username,password:password},function(err,doc){
		logger.log("look up username:"+username);
		if (doc) {
			logger.log("found username:"+username);
			callback(doc);
		}
		else
			callback(false);
	});
}

function login_session(client,user,callback) {
	UserSession.findOne({session:client.sessionId, valid:true},function(err,doc){
		logger.log("login session: "+user.username)
		var session = false;
		if (doc) {
			session = doc;
		}
		else session = new UserSession();
		session.session = client.sessionId;
		session.user_id = user._id;
		session.username = user.username;
		session.valid = true;
		session.save(function(err){
			logger.log("login client session: "+client.sessionId +" err:"+JSON.stringify(err));
			callback(true);
		});
	});
	
	
}

function check_user_session(username,callback) {
	UserSession.findOne({username:username, valid:true},function(err,doc){
		logger.log("get client session: "+client.sessionId+" doc:"+JSON.stringify(doc));
		if (doc) 
			callback(doc);
		else
			callback(false);
	});
}

function get_user_session(client,callback) {
	UserSession.findOne({session:client.sessionId, valid:true},function(err,doc){
		logger.log("get client session: "+client.sessionId+" doc:"+JSON.stringify(doc));
		if (doc) 
			callback(doc);
		else
			callback(false);
	});
}

function logout_session(client, callback) {
	UserSession.findOne({session:client.sessionId, valid:true},function(err,doc){
		logger.log("get client session: "+client.sessionId+" doc:"+JSON.stringify(doc));
		if (doc) {
			doc.valid = false;
			doc.save(function(err){
				callback(doc);
			});
		}
		else
			callback(false);
	});}

function save_message(user_id,message,callback) {
	User.findById(user_id,function(err,user){
		if(user){
			// create a comment
			var today = new Date();
			
			var Conversation = mongoose.model('Conversation');
			var con = new Conversation
			con.body = message;
			con.date = today;
			con.user_id = user._id;
			con.username = user.username;
			con.save(function(err){
				user.messages.push({ body:message, date:today });
				user.save(function (err) {
				  if(!err)
					callback(user);
				  else
					callback(false);
				});
			});			
			
		}
	});
}

function get_active_users(clients,callback,final_callback) {
	if(clients) {
		var keys;
		if(clients.length) 
			keys = clients
		else{
			keys = [];
			for (var k in clients)keys.push(k);
		}
		
		logger.log("get active users from clients");
		UserSession.findOne({session:keys[0], valid:true},function(err,doc){
			logger.log("get active users: docs:"+JSON.stringify(doc));
			if (doc)
				callback(doc);
			else
				callback(false);
			if(keys.length>1)
				get_active_users(_.rest(keys),callback,final_callback);
			else
				final_callback()
		});
	}else
		logger.log("get active users from no client");
		
}

function get_last_messages(count,callback){
	logger.log("getting last "+count+" messages");
	
	Conversation.find().sort('date',-1).limit(count).find(function (err,messages) {
		logger.log("last "+count+" messages: "+ JSON.stringify(messages));
		if(err)logger.log("error last "+count+" messages: "+ JSON.stringify(err));
		if(messages)
			callback(messages);
		else
			callback(false);
	});
}


function lahbot_remember(user_id, command, message, mode, callback){
	logger.log("lahbot remember things");
	User.findById(user_id,function(err,user){
		if(user){
			// create a comment
			var today = new Date();
			
			var i = new LahbotMemory();
			i.body = message;
			i.date = today;
			i.user_id = user._id;
			i.command = command;
			i.message = message;
			
			i.save(function(err){
				if(!err)
					callback(i);
				else
					callback(false);
			});			
			
		}
	});
}

function lahbot_command(command, callback){
	LahbotMemory.findOne({command:command},function(err,doc){
		if (doc)
			callback(doc);
		else
			callback(false);
	});
}


exports.login = login;
exports.login_session = login_session;
exports.logout_session = logout_session;
exports.get_user_session = get_user_session;
exports.check_user_session = check_user_session;
exports.save_message = save_message;
exports.get_active_users = get_active_users;
exports.get_last_messages = get_last_messages;
exports.lahbot_remember = lahbot_remember;
exports.lahbot_command = lahbot_command;
