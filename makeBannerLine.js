var hostname = "codecard.cf";
var port = 80;

var banner_submissions_limit = 10;

exports.process = function(db,callback){
	var content = "<b>Update:</b> Bạn có thể xem code của người khác bằng cách click chuột vào số điểm của họ | "; 
	db.query("SELECT COUNT(*) AS cnt FROM users", function(err,users,fields){
		if(err) throw err;
		content += "<b style='color:red'>Users: </b><b style='color:blue'>"+users[0].cnt+"</b>, ";

		db.query("SELECT SUM(grading_num) AS cnt FROM user_problems WHERE userid <> 'admin'", function(err,subs,fields){
			if(err) throw err;
			content += "<b style='color:red'>Submissions: </b><b style='color:blue'>"+subs[0].cnt+"</b>, ";

			db.query("SELECT COUNT(*) AS cnt FROM combats", function(err,combats,fields){
				if(err) throw err;
				content += "<b style='color:red'>Combats: </b><b style='color:blue'>"+combats[0].cnt/2+"</b>, ";

				db.query("SELECT * FROM user_problems WHERE userid <> 'admin' ORDER BY max_result_time DESC LIMIT "+banner_submissions_limit, function(err,submissions,fields){
					if(err) throw err;
					content += "<b style='color:red'>Last "+banner_submissions_limit+" submissions: </b>";

					for(var i=0;i<Math.min(submissions.length,banner_submissions_limit);i++){
						var row = "<a href='http://"+hostname+':'+port+"/user/"+submissions[i].userid+"'>"+
								submissions[i].userid+"</a> - ";

						row += "<a href='http://"+hostname+':'+port+"/problem/"+submissions[i].problemid+"'>"+
								submissions[i].problemid+"</a> - ";

						for(var j=1;j<=submissions[i].level;j++) row += '✪';

						row += " - <a href='http://"+hostname+':'+port+"/problem/"+submissions[i].problemid+"/code/"+submissions[i].userid+"'>"+submissions[i].max_result+"</a> - ";

						row += submissions[i].running_time+" s - ";

						row += submissions[i].max_result_time;

						if(i<Math.min(submissions.length,banner_submissions_limit)-1) row += " | ";

						content += row;

						if(i == Math.min(submissions.length,banner_submissions_limit)-1) callback(content);
					}
				});
			});
		});
	});
}