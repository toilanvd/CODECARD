exports.process = function(db,callback){
	db.query("SELECT * FROM algorithms ORDER BY algoid", function (error, results, fields) {
		var content = '<table>\n<tr><th>Algorithm ID</th>\n<th>Algorithm name</th>\n<th>Gift limit</th>\n<th>Level</th>\n</tr>\n';
		for(var i=0;i<results.length;i++){
			content += "<tr>\n";
			content += "<td>"+results[i].algoid+"</td>\n";
			content += "<td>"+results[i].name+"</td>\n";
			content += "<td>"+results[i].gift_limit+"</td>\n";
			content += "<td>"+results[i].level+"</td>\n";
			content += "</tr>\n";
		}
		content += "</table>\n";

		callback(content);
	});
}