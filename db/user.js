let model;

exports.model = function (mongoose) {
  // Standard Mongoose stuff here...
  var schema = mongoose.Schema;

  if (!model)
    model = mongoose.model(
      "users",
      new schema({
        username: String,
        email: String,
        nick: String,
        activation_key: String,
        activation_expiry: Date,
        password: String,
        password_salt: String,
        verified: Boolean,
        created_at: String,
        updated_at: String,
      })
    );

  return mongoose.model("users");
};

var _ = require("../lib/underscore")._,
  db = require("../lib/db").mongo,
  Logger = require("../lib/logger");
var Logger = require("../lib/logger");
var User = exports.model(db);

_.extend(exports.model, {
  login: function (username, password, callback) {
    User.findOne({ username: username, password: password }, function (
      err,
      doc
    ) {
      Logger.log("look up username:" + username);
      if (doc) {
        Logger.log("found username:" + username);
        callback(doc);
      } else {
        User.create({ username: username, password: password }, function (
          err,
          newUser
        ) {
          if (err) Logger.log("!!! error creating one:" + username);
          else {
            Logger.log("!!! username not found:" + username);
            Logger.log("Created one:" + username);
            callback(newUser);
          }
        });
      }
    });
  },
});
