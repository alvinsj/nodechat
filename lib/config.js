exports.serverPort = process.env.PORT || 3000;

exports.push_notify_url = function (user, message) {
  var link = "http://<server>/";
  var url =
    "http://<server>/push?nick=" +
    user +
    "&message=" +
    encodeURIComponent(message) +
    "&url=" +
    link +
    "&button=eat+me";
  return url;
};
