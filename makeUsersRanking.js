var hostname = "codecard.cf";
var port = 80;

exports.process = function(db,callback){
	var content = "<table>\n<tr><th rowspan='2'>no</th><th rowspan='2'>username</th><th colspan='4'>cards</th><th rowspan='2'>total</th></tr>\n";
	content += "<tr><th bgcolor='#00BFFF'>5✪</th><th bgcolor='#DA70D6'>4✪</th><th bgcolor='#FFA500'>3✪</th><th bgcolor='#FFFF00'>2✪</th></tr>\n";

	db.query("SELECT L234.userid AS userid, IFNULL(L234.2_star,0) AS two_star, IFNULL(L234.3_star,0) AS three_star, IFNULL(L234.4_star,0) AS four_star, IFNULL(L5.5_star,0) AS five_star FROM "+
			"(SELECT L23.userid, L23.2_star, L23.3_star, L4.4_star FROM "+
			"(SELECT L2.userid, L2.2_star, L3.3_star FROM (" +
			"(SELECT B.userid, IFNULL(L.2_star,0) AS 2_star FROM (SELECT userid, COUNT(*) FROM user_cards WHERE level>1 AND copy>0 GROUP BY userid) AS B "+
			"LEFT JOIN (SELECT userid, COUNT(*) AS 2_star FROM user_cards WHERE level=2 AND copy>0 GROUP BY userid) AS L "+
			"ON B.userid = L.userid) AS L2 "+
			"LEFT JOIN "+
			"(SELECT userid, COUNT(*) AS 3_star FROM user_cards WHERE level=3 AND copy>0 GROUP BY userid) AS L3 "+
			"ON L2.userid = L3.userid)) AS L23 "+
			"LEFT JOIN "+
			"(SELECT userid, COUNT(*) AS 4_star FROM user_cards WHERE level=4 AND copy>0 GROUP BY userid) AS L4 "+
			"ON L23.userid = L4.userid) AS L234 "+
			"LEFT JOIN "+
			"(SELECT userid, COUNT(*) AS 5_star FROM user_cards WHERE level=5 AND copy>0 GROUP BY userid) AS L5 "+
			"ON L234.userid = L5.userid "+
			"ORDER BY five_star DESC, four_star DESC, three_star DESC, two_star DESC, userid", function(err,users,fields){
		if(err) throw err;
		if(users.length == 0){
			content += '</table>\n';
			callback(content);
		}
		else{
			//////////////////// Modify hidden users
			for(var i=1;i<users.length;i++){
				if(users[i-1].userid == "player1"){
					var temp = users[i-1];
					users[i-1] = users[i];
					users[i] = temp;
				}
			}
			if(users.length > 0 && users[users.length-1].userid == "player1") users.pop();

			for(var i=1;i<users.length;i++){
				if(users[i-1].userid == "player2"){
					var temp = users[i-1];
					users[i-1] = users[i];
					users[i] = temp;
				}
			}
			if(users.length > 0 && users[users.length-1].userid == "player2") users.pop();

			for(var i=1;i<users.length;i++){
				if(users[i-1].userid == "admin"){
					var temp = users[i-1];
					users[i-1] = users[i];
					users[i] = temp;
				}
			}
			/////////////////////////////
			var cnt = 0;
			for(var i=0;i<users.length;i++){
				var total = users[i].five_star + users[i].four_star + users[i].three_star + users[i].two_star;
				if(users[i].userid == "admin"){
					content += "<tr bgcolor='greenyellow'><td></td><td><a href='http://"+hostname+':'+port+"/user/"+users[i].userid+"'>"+
					users[i].userid+"</a></td><td>"+users[i].five_star+"</td><td>"+users[i].four_star+"</td><td>"+
					users[i].three_star+"</td><td>"+users[i].two_star+"</td><td>"+total+"</td></tr>\n";
				}
				else if(i==0){
					content += "<tr bgcolor='gold'><td>"+(i+1).toString()+"</td><td><a href='http://"+hostname+':'+port+"/user/"+users[i].userid+"'>"+
							users[i].userid+"</a></td><td>"+users[i].five_star+"</td><td>"+users[i].four_star+"</td><td>"+
							users[i].three_star+"</td><td>"+users[i].two_star+"</td><td>"+total+"</td></tr>\n";
				}
				else if(i==1){
					content += "<tr bgcolor='silver'><td>"+(i+1).toString()+"</td><td><a href='http://"+hostname+':'+port+"/user/"+users[i].userid+"'>"+
							users[i].userid+"</a></td><td>"+users[i].five_star+"</td><td>"+users[i].four_star+"</td><td>"+
							users[i].three_star+"</td><td>"+users[i].two_star+"</td><td>"+total+"</td></tr>\n";
				}
				else if(i==2){
					content += "<tr bgcolor='#CD7F32'><td>"+(i+1).toString()+"</td><td><a href='http://"+hostname+':'+port+"/user/"+users[i].userid+"'>"+
							users[i].userid+"</a></td><td>"+users[i].five_star+"</td><td>"+users[i].four_star+"</td><td>"+
							users[i].three_star+"</td><td>"+users[i].two_star+"</td><td>"+total+"</td></tr>\n";
				}
				else{
					content += "<tr><td>"+(i+1).toString()+"</td><td><a href='http://"+hostname+':'+port+"/user/"+users[i].userid+"'>"+
							users[i].userid+"</a></td><td>"+users[i].five_star+"</td><td>"+users[i].four_star+"</td><td>"+
							users[i].three_star+"</td><td>"+users[i].two_star+"</td><td>"+total+"</td></tr>\n";
				}

				cnt++;
				if(cnt == users.length){
					content += '</table>\n';
					callback(content);
				}
			}
		}
	});
}