var hostname = "codecard.cf";
var port = 80;

exports.process = function(db,userid,callback){
	var content = "<table><tr><th>Problem</th><th>Level</th><th>Result</th><th>Run</th><th>Time</th><th>Gift</th><tr>\n";

	db.query("SELECT * FROM user_problems WHERE userid = '"+userid+
			"' AND type = 'freetraining' AND grading_num > 0 ORDER BY "+
			"level, max_result DESC, problemid", function(err,problems,fields){
		if(err) throw err;
		for(var i=0;i<problems.length;i++){
			row = "<tr>";

			row += "<td><a href='http://"+hostname+':'+port+"/problem/"+problems[i].problemid+"'>"+
					problems[i].problemid+"</a></td>";

			row += "<td>";
			for(var j=1;j<=problems[i].level;j++) row += '✪';
			row += "</td>";

			row += "<td>"+problems[i].max_result+"</td>";

			row += "<td>"+problems[i].running_time+" s</td>";

			row += "<td>"+problems[i].max_result_time+"</td>";

			if(problems[i].received_gift) row += "<td>OK</td>";
			else if(problems[i].max_result < 100) row += "<td></td>";
			else row += "<td><a href='http://"+hostname+":"+port+"/problem/"+problems[i].problemid+"'>"+
						"<button>get</button></a></td>";

			row += "</tr>\n";
			content += row;
		}
		
		db.query("SELECT * FROM user_problems WHERE userid = '"+userid+
				"' AND type = 'freetraining' AND grading_num = 0 ORDER BY "+
				"level, problemid", function(err,not_tried,fields){
			if(err) throw err;
			if(not_tried.length == 0){
				content += "</table>";
				callback(content);
			}
			else{
				var cnt = 0;
				for(var i=0;i<not_tried.length;i++){
					row = "<tr>";

					row += "<td><a href='http://"+hostname+':'+port+"/problem/"+not_tried[i].problemid+"'>"+
							not_tried[i].problemid+"</a></td>";

					row += "<td>";
					for(var j=1;j<=not_tried[i].level;j++) row += '✪';
					row += "</td>";

					row += "<td>0</td>";

					row += "<td>0 s</td>";

					row += "<td>0/0/0</td>";

					row += "<td></td>";
					
					row += "</tr>\n";
					content += row;

					cnt++;
					if(cnt == not_tried.length){
						content += "</table>";
						callback(content);
					}
				}
			}
		});

	});
}