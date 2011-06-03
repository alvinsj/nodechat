exports.log = function(msg){
	var today = new Date();
	console.log("["+today.toString()+"] "+msg);
};