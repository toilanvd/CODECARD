var hostname = "codecard.cf";
var port = 80;

exports.process = function(db,userid,callback){
	var content = "";

	db.query("SELECT * FROM users WHERE userid = '"+userid+"'", function(err,user,fields){
		if(err) throw err;

		content += "<p><b>Username:</b> "+user[0].userid+"</p>\n";
		content += "<p><b>Name:</b> "+user[0].username+"</p>\n";

		callback(content);
	});
}