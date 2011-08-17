exports.model = function (mongoose) {
    var schema = mongoose.Schema;

    mongoose.model('divs', new schema({
        user_id: String,
				chatroom_id: String,
				type: String,
				content: String,
				created_at: String,
				updated_at: String
    }));

    return mongoose.model('divs');
};
