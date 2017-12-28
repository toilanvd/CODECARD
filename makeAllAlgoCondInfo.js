exports.process = function(db,callback){
	db.query("SELECT * FROM algorithm_conditions ORDER BY algoid, cond_algo", function (error, results, fields) {
		var content = '<table>\n<tr><th>Algorithm ID</th>\n<th>Condition algorithm</th>\n</tr>\n';
		for(var i=0;i<results.length;i++){
			content += "<tr>\n";
			content += "<td>"+results[i].algoid+"</td>\n";
			content += "<td>"+results[i].cond_algo+"</td>\n";
			content += "</tr>\n";
		}
		content += "</table>\n";

		callback(content);
	});
}