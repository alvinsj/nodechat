
exports.prepare = function(session,request){
	obj = new Object();
	obj.meta = new Object();
	obj.meta.from = session.username;
	obj.meta.action = request.command;
}

exports.encode = function(obj,msg){
	obj.type = "message";
	obj.data = msg;
	return encode_message_meta(obj);
}

exports.encode_meta = function encode_message_meta(obj){
	obj.meta = new Object();
	obj.meta.kind = "html";
	return JSON.stringify(obj);
}
