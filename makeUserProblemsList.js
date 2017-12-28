var hostname = "codecard.cf";
var port = 80;

exports.process = function(db,userid,callback){
	var content = "<table><tr><th>Problem</th><th>Level</th><th>Result</th><th>Run</th><th>Time</th><tr>\n";

	db.query("SELECT * FROM user_problems WHERE userid = '"+userid+
			"' AND (type = 'freetraining' OR type = 'algotraining') AND grading_num > 0 ORDER BY "+
			"level, max_result DESC, problemid", function(err,problems,fields){
		if(err) throw err;
		if(problems.length == 0){
			content += "</table>";
			callback(content);
		}
		else{
			var cnt = 0;
			for(var i=0;i<problems.length;i++){
				var row = "<tr>";

				row += "<td><a href='http://"+hostname+':'+port+"/problem/"+problems[i].problemid+"'>"+
						problems[i].problemid+"</a></td>";

				row += "<td>";
				for(var j=1;j<=problems[i].level;j++) row += '✪';
				row += "</td>";

				row += "<td><a href='http://"+hostname+':'+port+"/problem/"+problems[i].problemid+"/code/"+userid+"'>"+problems[i].max_result+"</a></td>";

				row += "<td>"+problems[i].running_time+" s</td>";

				row += "<td>"+problems[i].max_result_time+"</td>";

				row += "</tr>\n";
				content += row;

				cnt++;
				if(cnt == problems.length){
					content += "</table>";
					callback(content);
				}
			}
		}

	});
}