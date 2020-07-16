const config = require("./lib/config");

module.exports = function (app) {
  // app.configure("development", function () {
  app.use(require("express").static(__dirname + "/public"));
  // });

  // app.configure("production", function () {
  //   var oneYear = 31557600000;
  //   app.use(
  //     require("express").static(__dirname + "/public", { maxAge: oneYear })
  //   );
  // app.use(express.errorHandler());
  // });

  //   app.get("/", function (req, res) {
  //     res.send("hello world lah!");
  //   });

  //   app.get("/chat/?", function (req, res) {
  //     res.redirect("chat/");
  //   });
};
