var hostname = "codecard.cf";
var port = 80;

var max_cookie_time = 15;
var idle_time = 3;
var max_combat_time = 63;

exports.process = function(db,userid,minute,callback){
	var user_row = [];

	var content = "<table>\n<tr bgcolor='aquamarine'><th>username</th>\n<th>status</th>\n<th>block</th>\n<th>challenge</th>\n</tr>\n";
	
	db.query("SELECT * FROM combats WHERE userid = '"+userid+"' AND ended = false", function(err,combat,fields){
		if(err) throw err;

		var in_combat;
		if(combat.length == 0){
			content += "<tr bgcolor='bisque'><td><a href='http://"+hostname+":"+port+"/user/"+userid+"'>"+userid+"</a></td><td style='color:green'>online</td><td></td><td></td></tr>\n";
			in_combat = false;
		}
		else{
			content += "<tr bgcolor='bisque'><td><a href='http://"+hostname+":"+port+"/user/"+userid+"'>"+userid+"</a></td><td style='color:red'>in combat</td><td></td><td></td></tr>\n";
			in_combat = true;
		}

		db.query("SELECT * FROM users WHERE userid <> '"+userid+"' ORDER BY last_online_time DESC", function(err,users,fields) {
			if(err) throw err;

			if(users.length == 0){
				content += "</table>\n";
				callback(content);
			}
			else{
				for(var i=0;i<users.length;i++) user_row.push(users[i].userid);

				var cnt = 0;
				for(var i=0;i<users.length;i++){
					db.query("SELECT T.blockid, T.last_online_time, T.userid, combats.combatid FROM (SELECT * FROM (SELECT u.userid AS blockid, last_online_time, b.userid AS userid FROM users u LEFT JOIN block_list b ON b.userid = '"+
							userid+"' AND u.userid = '"+users[i].userid+"' AND u.userid = b.blockid) AS Q WHERE Q.blockid = '"+users[i].userid+
							"') AS T LEFT JOIN combats ON T.blockid = combats.userid AND combats.ended = false", function(err,block_user,fields){
						if(err) throw err;

						var row = "<tr>";

						row += "<td><a href='http://"+hostname+":"+port+"/user/"+block_user[0].blockid+"'>"+block_user[0].blockid+"</td>";

						var last_online_time = minute-block_user[0].last_online_time;

						if(block_user[0].combatid != null) row += "<td style='color:red'>in combat</td>";
						else if(last_online_time>max_cookie_time) row += "<td style='color:grey'>offline</td>";
						else if(last_online_time>=idle_time) row += "<td style='color:blue'>"+last_online_time+" mins</td>";
						else row += "<td style='color:green'>online</td>";

						if(block_user[0].userid == userid){
							row += "<td><input type='checkbox' value='"+block_user[0].blockid+
									"' checked onchange='toggle_block_user(this)'></td>";
						}
						else{
							row += "<td><input type='checkbox' value='"+block_user[0].blockid+
									"' onchange='toggle_block_user(this)'></td>";
						}
						
						if(!in_combat && block_user[0].combatid == null && last_online_time<=max_cookie_time)
							row += "<td><button value='"+block_user[0].blockid+"' onclick='send_challenge(this)'>Send</button></td>";
						else row += "<td></td>";

						row += "</tr>\n";

						for(var j=0;j<users.length;j++){
							if(block_user[0].blockid == user_row[j]){
								user_row[j] = row;
								break;
							}
						}

						cnt++;
						if(cnt == users.length){
							for(var j=0;j<users.length;j++) content += user_row[j];

							content += "</table>\n";
							callback(content);
						}
					});
				}
			}
		});
	});
}