var database = require('./database'),
	socketclient = require('./socketclient'),
	logger = require('./logger');
	
var googlemaps = require('googlemaps');
	

exports.checkin = function(socket,client,request){
	// make sure user already logged in
	database.get_user_session(client,function(session){
		// allow reverse geocode and check in
		if(session) {
			logger.log("Reversing geocode: "+request.latlng);
			
			googlemaps.reverseGeocode(request.latlng, function(err,data) {
				var address = data;
				address = address.results;
				address = address[0];
				address = address.formatted_address;
				socketclient.broadcast(socket,session.username+" just checked in around <a target='_blank' href='http://yourphpserver.com/map.php?latlng="+request.latlng+"'>"+address+"</a>"); 
			});
		}
		else
			socketclient.message(client,"<p style='color:grey'>Please login in order to chat.</p>");
	});
}