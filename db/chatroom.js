exports.model = function (mongoose) {
    var schema = mongoose.Schema;

    mongoose.model('chatrooms', new schema({
        name: String,
				admin_id: String,
				admin_email: String,
				type: String,
				active: Boolean,
				created_at: String,
				updated_at: String
    }));

    return mongoose.model('chatrooms');
};


