exports.model = function (mongoose) {
  // Standard Mongoose stuff here...
  var schema = mongoose.Schema;

  mongoose.model(
    "sessions",
    new schema({
      client_id: String,
      email: String,
      user_id: String,
      chatroom: String,
      created_at: String,
      updated_at: String,

      session: String,
      username: String,
      valid: Boolean,
    })
  );

  return mongoose.model("sessions");
};

var _ = require("../lib/underscore")._,
  db = require("../lib/db").mongo,
  Logger = require("../lib/logger");
var Session = exports.model(db);

_.extend(exports.model, {
  login_session: function (client, user, callback) {
    Session.findOne({ session: client.id, valid: true }, function (err, doc) {
      Logger.log("login session: " + user.username);
      var session = false;
      if (doc) {
        session = doc;
      } else session = new Session();
      session.session = client.id;
      session.user_id = user._id;
      session.username = user.username;
      session.valid = true;
      session.save(function (err) {
        Logger.log(
          "login client session: " + client.id + " err:" + JSON.stringify(err)
        );
        callback(true);
      });
    });
  },

  check_user_session: function (username, callback) {
    Session.findOne({ username: username, valid: true }, function (err, doc) {
      Logger.log(
        "check client session with username: " +
          username +
          " doc:" +
          JSON.stringify(doc)
      );
      if (doc) callback(doc);
      else callback(false);
    });
  },

  get_user_session: function (client, callback) {
    Session.findOne({ session: client.id, valid: true }, function (err, doc) {
      Logger.log(
        "get client session: " + client.id + " doc:" + JSON.stringify(doc)
      );
      if (doc) callback(doc);
      else callback(false);
    });
  },

  logout_session: function (client, callback) {
    Session.findOne({ session: client.id, valid: true }, function (err, doc) {
      Logger.log(
        "logout client session: " + client.id + " doc:" + JSON.stringify(doc)
      );
      if (doc) {
        doc.valid = false;
        doc.save(function (err) {
          callback(doc);
        });
      } else callback(false);
    });
  },

  get_active_users: function (clients, callback, final_callback) {
    if (clients) {
      var keys;
      if (clients.length) keys = clients;
      else {
        keys = [];
        for (var k in clients) keys.push(k);
      }

      Logger.log("get active users from clients");
      Session.findOne({ session: keys[0], valid: true }, function (err, doc) {
        Logger.log("get active users: docs:" + JSON.stringify(doc));
        if (doc) callback(doc);
        else callback(false);
        if (keys.length > 1)
          exports.model.get_active_users(
            _.rest(keys),
            callback,
            final_callback
          );
        else final_callback();
      });
    } else Logger.log("get active users from no client");
  },
});
