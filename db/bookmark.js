exports.model = function (mongoose) {
    var schema = mongoose.Schema;

    mongoose.model('bookmarks', new schema({
        message_id: String,
				user_id: String,
				created_at: String,
				updated_at: String
    }));

    return mongoose.model('bookmarks');
};
