(function () {
  // Todo
  window.Message = Backbone.Model.extend({
    toggle: function () {
      this.save({ done: !this.get("done") });
    },

    // Remove this Todo from *localStorage*, deleting its view.
    clear: function () {
      this.destroy();
      $(this.view.el).dispose();
    },
  });

  // Todo List
  window.MessageList = Backbone.Collection.extend({
    model: Message,
    localStorage: new Store("messages"),

    // Returns all done todos.
    done: function () {
      return this.filter(function (message) {
        return !message.get("done");
      });
    },

    nextOrder: function () {
      if (!this.length) return 1;
      return this.last().get("order") + 1;
    },

    comparator: function (message) {
      return message.get("order");
    },

    pluralize: function (count) {
      return count == 1 ? "item" : "items";
    },
  });

  window.Messages = new MessageList();

  window.MessageView = Backbone.View.extend({
    tagName: "li",
    className: "message",

    template: _.template(
      "<input type='checkbox' class='message-check' style='display:none'/><div class='message-content'></div><span class='message-destroy' style='display:none'></span><input type='text' class='message-input' />"
    ),

    events: {
      "click .message-check": "toggleDone",
      "dblclick .message-content": "edit",
      "click .message-destroy": "clear",
      "keypress .message-input": "updateOnEnter",
    },

    initialize: function () {
      _.bindAll(this, "render", "close");
      this.model.bind("change", this.render);
      this.model.view = this;
    },

    render: function () {
      $(this.el).set("html", this.template(this.model.toJSON()));
      $(this.el).setProperty("id", "message-" + this.model.id);
      this.setContent();
      sortableMessages.addItems(this.el);
      return this;
    },

    setContent: function () {
      var content = this.model.get("content");
      this.$(".message-content").set("html", content);
      this.$(".message-input").setProperty("value", content);

      if (this.model.get("done")) {
        this.$(".message-check").setProperty("checked", "checked");
        $(this.el).addClass("done");
      } else {
        this.$(".message-check").removeProperty("checked");
        $(this.el).removeClass("done");
      }

      this.input = this.$(".message-input");
      this.input.addEvent("blur", this.close);
    },

    toggleDone: function () {
      this.model.toggle();
    },

    edit: function () {
      $(this.el).addClass("editing");
      //this.input.fireEvent("focus");
      this.input.focus();
    },

    close: function () {
      this.model.save({ content: this.input.getProperty("value") });
      $(this.el).removeClass("editing");
    },

    updateOnEnter: function (e) {
      if (e.code == 13) this.close();
    },

    clear: function () {
      this.model.clear();
    },
  });

  var sortableMessages = new Sortables("message-list", {
    constrain: true,
    clone: true,
    handle: ".message-content",
    onComplete: function (ele) {
      sortableMessages.serialize(false, function (element, index) {
        message = Messages.get(
          element.getProperty("id").replace("message-", "")
        );
        message.save({ order: index });
      });
    },
  });
  window.AppView = Backbone.View.extend({
    el: $("chatroomapp"),
    statsTemplate: _.template(
      '<% if (total) { %><span class="message-count"><span class="number"><%= total %></span><span class="word"> message <%= remaining == 1 ? "item" : "items" %></span> added.</span><% } %><% if (true) { %><span class="message-clear"><a href="#">Clear <span class="number-done"><%= done %> </span>message <span class="word-done"><%= total == 1 ? "item" : "items" %></span></a></span><% } %>'
    ),

    events: {
      "keypress #new-message": "createOnEnter",
      "keypress #password": "loginOnEnter",
      "keyup #new-message": "showTooltip",
      "click #page-title": "scroll",
      "click .message-clear": "clearCompleted",
    },

    initialize: function () {
      _.bindAll(this, "addOne", "addAll", "render");

      this.input = this.$("#new-message");

      Messages.bind("add", this.addOne);
      Messages.bind("refresh", this.addAll);
      Messages.bind("all", this.render);

      Messages.fetch();
      socket.connect();
      var app = this;
      socket.on("connect", function () {
        socket.send(
          JSON.stringify({
            ip: ipaddr,
          })
        );
      });

      socket.on("message", function (msg) {
        app.appendMessage(msg);
      });

      socket.on("disconnect", function () {
        app.appendMessage("<p style='color:red'>Disconnected.</p>");
      });
    },
    getGeoLocation: function () {
      if (navigator.geolocation)
        navigator.geolocation.getCurrentPosition(
          this.sendGeoLocationToServer,
          this.geoLocationError
        );
      else this.appendMessage("Location not available");
    },

    sendGeoLocationToServer: function (position) {
      var lat = position.coords.latitude;
      var lng = position.coords.longitude;
      socket.send(
        JSON.stringify({
          command: "checkin",
          latlng: lat + "," + lng,
        })
      );
    },

    geoLocationError: function (error) {
      this.appendMessage("geolocator error code:" + error.code);
    },

    appendMessage: function (message) {
      Messages.create({
        content: message,
        done: false,
      });
      var scroll = new Fx.Scroll(window);
      scroll.toElement("new-message");

      if (
        message == "<p style='color:grey'>Please login in order to chat.</p>" ||
        message == "<p style='color:red'>Disconnected.</p>" ||
        message == "<p style='color:grey'>you have been logged out!</p>"
      )
        if (this.$("#username").getProperty("value")) $("password").focus();
        else $("username").focus();
      //$("#chat").append("<p>"+message+"</p>");
    },
    scroll: function () {
      var scroll = new Fx.Scroll(window);
      scroll.toElement("new-message");
    },

    render: function () {
      var done = Messages.done().length;
      this.$("#message-stats").set(
        "html",
        this.statsTemplate({
          done: done,
          total: Messages.length,
          remaining: Messages.length - done,
        })
      );
    },

    addOne: function (message) {
      var view = new MessageView({ model: message }).render().el;
      this.$("#message-list").grab(view);
      sortableMessages.addItems(view);
    },

    addAll: function () {
      Messages.each(this.addOne);
    },

    createOnEnter: function (e) {
      if (e.code != 13) return;
      /*Messages.create({
        content: this.input.getProperty("value"),
        done:    false
      });*/
      socket.send(
        JSON.stringify({
          command: "message",
          message: this.input.getProperty("value"),
        })
      );
      this.input.setProperty("value", "");
    },
    loginOnEnter: function (e) {
      if (e.code != 13) return;
      /*Messages.create({
        content: this.input.getProperty("value"),
        done:    false
      });*/
      socket.send(
        JSON.stringify({
          command: "login",
          username: this.$("#username").getProperty("value"),
          password: this.$("#password").getProperty("value"),
        })
      );
      this.$("#password").setProperty("value", "");
      // this.getGeoLocation();
      $("new-message").focus();
    },

    showTooltip: function (e) {
      var tooltip = this.$(".ui-tooltip-top");
      tooltip.fade("out");

      if (this.tooltipTimeout) clearTimeout(this.tooltipTimeout);

      if (
        this.input.getProperty("value") !== "" &&
        this.input.getProperty("value") !==
          this.input.getProperty("placeholder")
      ) {
        this.tooltipTimeout = setTimeout(function () {
          tooltip.fade("in");
        }, 1000);
      }
    },

    clearCompleted: function () {
      _.each(Messages.done(), function (message) {
        message.clear();
      });
      return false;
    },
  });

  window.App = new AppView();
  $("username").focus();
})();
