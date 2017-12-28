var hostname = "codecard.cf";
var port = 80;

var action = require('./action.js');

var half_INF = 500000000;

function get_combat_info(combat,callback){
	callback(combat.combatid,combat.oppid,combat.challenge);
}

function make_my_combats(db,userid,callback){
	var combat_row = [];

	var content = "<table>\n<tr bgcolor='aquamarine'><th>vs</th><th>you</th><th>opp</th><th>time</th><th>level</th><th>challenge</th><th>gift</th><th>Free Train</th><th>link</th></tr>\n";
	
	db.query("SELECT * FROM combats WHERE userid = '"+userid+"' ORDER BY start_minute DESC", function(err,combats,fields){
		if(err) throw err;
		if(combats.length == 0){
			content += '</table>\n';
			callback(content);
		}
		else{
			for(var i=0;i<combats.length;i++) combat_row.push(combats[i].combatid);

			var cnt = 0, current_combat = combats[0].combatid;
			for(var i=0;i<combats.length;i++){
				get_combat_info(combats[i],function(combatid,oppid,challenge){
					// start row
					var row = "";
					if(combatid == current_combat) row += "<tr bgcolor='bisque'>";
					else row += "<tr>";

					// opponent id
					row += "<td><a href='http://"+hostname+":"+port+"/user/"+oppid+"'>"+oppid+"</td>";

					action.get_combat_winner(combatid,function(winner){
						action.get_combat_score(userid,combatid,function(your_score){
							var your_color = "";
							if(winner == userid) your_color = " style='color:green'";
							else if(winner == oppid) your_color = " style='color:red'";

							if(your_score < half_INF) row += "<td"+your_color+">"+your_score+"</td>";
							else row += "<td"+your_color+">∞</td>";
							
							action.get_combat_score(oppid,combatid,function(opp_score){
								var opp_color = "";
								if(winner == userid) opp_color = " style='color:red'";
								else if(winner == oppid) opp_color = " style='color:green'";

								if(opp_score < half_INF) row += "<td"+opp_color+">"+opp_score+"</td>";
								else row += "<td"+opp_color+">∞</td>";

								action.get_combat_time(combatid,function(combat_minute,combat_second){
									if(combat_minute == -1) row += "<td style='color:red'>FT</td>";
									else if(combat_minute == -2) row += "<td style='color:blue'>WT</td>";
									else row += "<td style='color:green'>"+combat_minute+"'</td>";

									action.get_combat_level(combatid,function(combat_level){
										row += "<td>";
										for(var j=1;j<=combat_level;j++) row += '✪';
										row += "</td>";

										// challenge
										if(challenge) row += "<td>yes</td>";
										else row += "<td></td>";

										action.check_received_combat_gift(userid,combatid,function(allow_receive){
											if(!allow_receive) row += "<td></td>";
											else row += "<td><form method='GET' action='http://"+hostname+":"+port+
														"/combat/gift/"+combatid+"'><input value='get' type='submit'></form></td>";

											action.check_add_to_freetraining(userid,combatid,function(allow_add){
												if(!allow_add) row += "<td></td>";
												else row += "<td><form method='GET' action='http://"+hostname+":"+port+
														"/combat/add_to_freetraining/"+combatid+"'><input value='add' type='submit'></form></td>";

												// combat link
												row += "<td><a href='http://"+hostname+":"+port+"/combat/"+combatid+"'>link</a></td>";

												// end row
												row += "</tr>\n";
												
												for(var j=0;j<combats.length;j++){
													if(combatid == combat_row[j]){
														combat_row[j] = row;
														break;
													}
												}

												// last row
												cnt++;
												if(cnt == combats.length){
													for(var j=0;j<combats.length;j++) content += combat_row[j];
													content += '</table>\n';
													callback(content);
												}
											});
										});
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

function make_user_combats(db,userid,callback){
	var combat_row = [];

	var content = "<table>\n<tr bgcolor='aquamarine'><th>vs</th><th>scr</th><th>opp</th><th>time</th><th>level</th><th>challenge</th><th>link</th></tr>\n";
	
	db.query("SELECT * FROM combats WHERE userid = '"+userid+"' ORDER BY start_minute DESC", function(err,combats,fields){
		if(err) throw err;
		if(combats.length == 0){
			content += '</table>\n';
			callback(content);
		}
		else{
			for(var i=0;i<combats.length;i++) combat_row.push(combats[i].combatid);

			var cnt = 0, current_combat = combats[0].combatid;
			for(var i=0;i<combats.length;i++){
				get_combat_info(combats[i],function(combatid,oppid,challenge){
					// start row
					var row = "";
					if(combatid == current_combat) row += "<tr bgcolor='bisque'>";
					else row += "<tr>";

					// opponent id
					row += "<td><a href='http://"+hostname+":"+port+"/user/"+oppid+"'>"+oppid+"</td>";

					action.get_combat_winner(combatid,function(winner){
						action.get_combat_score(userid,combatid,function(your_score){
							var your_color = "";
							if(winner == userid) your_color = " style='color:green'";
							else if(winner == oppid) your_color = " style='color:red'";

							if(your_score < half_INF) row += "<td"+your_color+">"+your_score+"</td>";
							else row += "<td"+your_color+">∞</td>";
							
							action.get_combat_score(oppid,combatid,function(opp_score){
								var opp_color = "";
								if(winner == userid) opp_color = " style='color:red'";
								else if(winner == oppid) opp_color = " style='color:green'";

								if(opp_score < half_INF) row += "<td"+opp_color+">"+opp_score+"</td>";
								else row += "<td"+opp_color+">∞</td>";

								action.get_combat_time(combatid,function(combat_minute,combat_second){
									if(combat_minute == -1) row += "<td style='color:red'>FT</td>";
									else if(combat_minute == -2) row += "<td style='color:blue'>WT</td>";
									else row += "<td style='color:green'>"+combat_minute+"'</td>";

									action.get_combat_level(combatid,function(combat_level){
										row += "<td>";
										for(var j=1;j<=combat_level;j++) row += '✪';
										row += "</td>";

										// challenge
										if(challenge) row += "<td>yes</td>";
										else row += "<td></td>";

										row += "<td><a href='http://"+hostname+":"+port+"/combat/"+combatid+"'>link</a></td>\n";
			
										// end row
										row += "</tr>\n";
										
										for(var j=0;j<combats.length;j++){
											if(combatid == combat_row[j]){
												combat_row[j] = row;
												break;
											}
										}

										// last row
										cnt++;
										if(cnt == combats.length){
											for(var j=0;j<combats.length;j++) content += combat_row[j];
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

exports.process = function(db,userid,mine,callback){
	if(mine){
		make_my_combats(db,userid,function(content){
			callback(content);
		});
	}
	else{
		make_user_combats(db,userid,function(content){
			callback(content);
		});
	}
}