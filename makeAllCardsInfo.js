exports.process = function(db,callback){
	db.query("SELECT * FROM cards ORDER BY cardid", function (error, results, fields) {
		var content = '<table>\n<tr><th>Card ID</th>\n<th>Card name</th>\n<th>Level</th>\n<th>Popularity</th>\n</tr>\n';
		for(var i=0;i<results.length;i++){
			content += "<tr>\n";
			content += "<td>"+results[i].cardid+"</td>\n";
			content += "<td>"+results[i].name+"</td>\n";
			content += "<td>"+results[i].level+"</td>\n";
			content += "<td>"+results[i].popularity+"</td>\n";
			content += "</tr>\n";
		}
		content += "</table>\n";

		callback(content);
	});
}