var hostname = "codecard.cf";
var port = 80;

var action = require('./action.js');

var half_INF = 500000000;

function get_combat_info(combat,callback){
	callback(combat.combatid,combat.userid,combat.oppid,combat.challenge);
}

exports.process = function(db,callback){
	var combat_row = [];

	content = "<table>\n<tr><th>player 1</th><th>score</th><th>player 2</th><th>time</th><th>level</th></tr>\n";

	db.query("SELECT * FROM combats ORDER BY start_minute DESC, start_second DESC, combatid, userid", function(err,combats,fields){
		if(err) throw err;
		if(combats.length == 0){
			content += '</table>\n';
			callback(content);
		}
		else{
			for(var i=0;i<combats.length;i+=2) combat_row.push(combats[i].combatid);

			var cnt = 0;
			for(var i=0;i<combats.length;i+=2){
				get_combat_info(combats[i],function(combatid,userid,oppid,challenge){
					var row = "<tr>";

					// player 1
					row += "<td><a href='http://"+hostname+":"+port+"/user/"+userid+"'>"+userid+"</td>";

					action.get_combat_winner(combatid,function(winner){
						action.get_combat_score(userid,combatid,function(your_score){
							action.get_combat_score(oppid,combatid,function(opp_score){
								row += "<td><a href='http://"+hostname+":"+port+"/combat/"+combatid+"'><u>";

								var your_color = "";
								if(winner == userid) your_color = " style='color:green'";
								else if(winner == oppid) your_color = " style='color:red'";

								if(your_score < half_INF) row += "<span"+your_color+">"+your_score+"</span>";
								else row += "<span"+your_color+">∞</span>";

								row += " - ";

								var opp_color = "";
								if(winner == userid) opp_color = " style='color:red'";
								else if(winner == oppid) opp_color = " style='color:green'";

								if(opp_score < half_INF) row += "<span"+opp_color+">"+opp_score+"</span>";
								else row += "<span"+opp_color+">∞</span>";

								row += "</u></a></td>";

								// player 2
								row += "<td><a href='http://"+hostname+":"+port+"/user/"+oppid+"'>"+oppid+"</td>";

								action.get_combat_time(combatid,function(combat_minute,combat_second){
									if(combat_minute == -1) row += "<td style='color:red'>FT</td>";
									else if(combat_minute == -2){
										row += "<td style='color:blue'>WT</td>";
										row = "<tr bgcolor='#7FFFD4'>"+row.split('<tr>')[1];
									}
									else{
										row += "<td style='color:green'>"+combat_minute+"'</td>";
										row = "<tr bgcolor='#ADFF2F'>"+row.split('<tr>')[1];
									}

									action.get_combat_level(combatid,function(combat_level){
										row += "<td>";
										for(var j=1;j<=combat_level;j++) row += '✪';
										row += "</td>";

										row += "</tr>\n";

										for(var j=0;j<combat_row.length;j++){
											if(combatid == combat_row[j]){
												combat_row[j] = row;
												break;
											}
										}

										cnt+=2;
										// last row
										if(cnt == combats.length){
											for(var j=0;j<combat_row.length;j++) content += combat_row[j];
											content += '</table>\n';
											callback(content);
										}
									});
								});
							});
						});
					});
				});
			}
		}
	});
}