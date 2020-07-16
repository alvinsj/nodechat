
(function(){
	
  window.AppView = Backbone.View.extend({
  
    el: $("chatroomapp"),

    events: {
	    "keypress #email" : "startOnEnter"
    },
  
    initialize: function() {
    },

		startOnEnter: function(e) {
    	if (e.code != 13) return;
			var chatroom = this.$('#chatroom').getProperty("value");
			var email = this.$('#email').getProperty("value")
			var req = new Request({url: 'start', method: 'post'});
			req.send('chatroom='+chatroom+'&email='+email);
    },
  
  
  });

  window.App = new AppView;
	
}());

