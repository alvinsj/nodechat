exports.message = function(client, message){
	client.send(message);
}

exports.broadcast = function(socket, message){
	socket.broadcast(message);
}
