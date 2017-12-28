var hostname = "codecard.cf";
var port = 80;

exports.process = function(db,problemid,callback){
	var content = "<table>\n<tr bgcolor='#DCDCDC'><th>username</th><th>score</th><th>run</th><th>time</th></tr>\n";

	db.query("SELECT u.userid, u.username, p.max_result, p.running_time, p.max_result_time FROM users u, user_problems p WHERE u.userid = p.userid AND p.problemid = '"+
			problemid+"' AND p.grading_num > 0 ORDER BY max_result DESC, max_result_time, running_time, u.userid", function(err,users,fields){
		if(err) throw err;
		if(users.length == 0){
			content += '</table>\n';
			callback(content);
		}
		else{
			var cnt = 0;
			for(var i=0;i<users.length;i++){
				content += "<tr bgcolor='#ADFF2F'><td><a href='http://"+hostname+':'+port+"/user/"+users[i].userid+"'>"+
							users[i].username+"</a></td><td><a href='http://"+hostname+':'+port+"/problem/"+problemid+"/code/"+users[i].userid+"'>"+users[i].max_result+
							"</a></td><td>"+users[i].running_time+" s</td><td>"+users[i].max_result_time+"</td></tr>\n";

				cnt++;
				if(cnt == users.length){
					content += '</table>\n';
					callback(content);
				}
			}
		}
	});
}