var Googlemaps = require('googlemaps');

var Session = require('../db/session').model,
		Pipe = require('./pipe'),
		Logger = require('./logger');
	
exports.checkin = function(socket,client,request){
	// make sure user already logged in
	Session.get_user_session(client,function(session){
		// allow reverse geocode and check in
		if(session) {
			Logger.log(session.username+" check in: "+request.latlng);
			
			Googlemaps.reverseGeocode(request.latlng, function(err,data) {
				var address = data;
				address = address.results;
				address = address[0];
				address = address.formatted_address;
				//Pipe.broadcast(socket,session.username+" just checked in around <a target='_blank' href='http://yourphpserver.com/map.php?latlng="+request.latlng+"'>"+address+"</a>"); 
			});
		}
		else
			Pipe.message(client,"<p style='color:grey'>Please login in order to chat.</p>");
	});
}