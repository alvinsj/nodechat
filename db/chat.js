exports.model = function (mongoose) {
    var schema = mongoose.Schema;

    mongoose.model('chats', new schema({
        message: String,
				chatroom_id: String,
				user_id: String,
				created_at: String,
				updated_at: String,
				
				body: String,
				username: String,
				date: Date,
    }));

    return mongoose.model('chats');
};

var _ = require('../lib/underscore')._,
		db = require('../lib/db').mongo,
		Logger = require('../lib/logger');

var User = require('./user').model(db),
		Chat = exports.model(db);

_.extend(exports.model, {
	save_message: function(user_id,message,callback) { Logger.log("Saving message: "+message)
		User.findById(user_id,function(err,user){
			if(user){
				// create a comment
				var today = new Date();
				var con = new Chat();
				con.body = message;
				con.date = today;
				con.user_id = user._id;
				con.username = user.username;
				con.save(function(err){
					//user.messages.push({ body:message, date:today });
					user.save(function (err) {
					  if(!err)
						callback(user);
					  else
						callback(false);
					});
				});			
			
			}
		});
	},

	get_last_messages: function(count,callback){ Logger.log("getting last "+count+" messages");
		
		Chat.find().sort('date',-1).limit(count).find(function (err,messages) {
			Logger.log("last "+count+" messages: "+ JSON.stringify(messages));
			
			if(err) 
				Logger.log("error last "+count+" messages: "+ JSON.stringify(err));
			
			if(messages)
				callback(messages);
			else
				callback(false);
		});
	}
});