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

mongoose.model('User',User);
mongoose.model('UserSession', UserSession);
mongoose.model('Conversation', Conversation);

exports.db = mongoose;


var User = mongoose.model('User');
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

var UserSession = mongoose.model('UserSession');
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

var Conversation = mongoose.model('Conversation');

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

exports.login = login;
exports.login_session = login_session;
exports.logout_session = logout_session;
exports.get_user_session = get_user_session;
exports.save_message = save_message;
exports.get_active_users = get_active_users;
exports.get_last_messages = get_last_messages;
