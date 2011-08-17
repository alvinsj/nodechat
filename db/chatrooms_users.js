exports.model = function (mongoose) {
    var schema = mongoose.Schema;

    mongoose.model('chatrooms_users', new schema({
        chatroom_id: String,
				user_id: String,
				user_email: String,
				created_at: String,
				updated_at: String
    }));

    return mongoose.model('chatrooms_users');
};
