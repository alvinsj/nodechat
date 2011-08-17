exports.model = function (mongoose) {
    // Standard Mongoose stuff here...
    var schema = mongoose.Schema;

    mongoose.model('lahbot', new schema({
        user_id:String,
				command:String,
				message:String,
				mode:String
    }));

    return mongoose.model('lahbot');
};

var _ = require('../lib/underscore')._,
		db = require('../lib/db').mongo,
		Logger = require('../lib/logger');;
var User = require('./user').model(db),
		Lahbot = require('./lahbot').model(db);

_.extend(exports.model, {
	lahbot_remember: function(user_id, command, message, mode, callback){
		Logger.log("lahbot remember things");
		User.findById(user_id,function(err,user){
			if(user){
				// create a comment
				var today = new Date();
			
				var i = new Lahbot();
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
	},

	lahbot_command: function (command, callback){
		LahbotMemory.findOne({command:command},function(err,doc){
			if (doc)
				callback(doc);
			else
				callback(false);
		});
	}
});
