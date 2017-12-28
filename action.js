var mysql = require('mysql');
var db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'codecard',
  database : 'CODECARDtest'
});
db.connect();
// Can use db.end() to disconnect database

var http = require('http');
var fs = require('fs');
var path = require('path');
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var exec = require('child_process').exec;
var execFile = require('child_process').execFile;
var assert = require('assert');
var async = require('async');

var judge = require('./judge.js');

var max_cookie_time = 15;
var max_combat_time = 63;
var max_combat_ingame_time = 60;
var max_challenge_time = 15;
var judging_time = 3;

var minimum_combat_gift_score = 50;

var INF = 1000000000;

var number_of_cards = 27;
var default_submit_left = 3;
var card_effect = [];

var number_of_missions = 6;
var mission = [];

var cookie_length = 15;
var combatid_length = 10;
var combat_generator;

var makeUserProfile = require('./makeUserProfile.js');
var makeAllCombats = require('./makeAllCombats.js');
var makeAlgorithmProblemList = require('./makeAlgorithmProblemList.js');
var makeFreetrainingProblemList = require('./makeFreetrainingProblemList.js');
var makeUserProblemsList = require('./makeUserProblemsList.js');
var makeProblemRanking = require('./makeProblemRanking.js');

var makeBannerLine = require('./makeBannerLine.js');
var makeUsersRanking = require('./makeUsersRanking.js');
var makeUsersStatus = require('./makeUsersStatus.js');
var makeUserCombats = require('./makeUserCombats.js');

var makeMissionsList = require('./makeMissionsList.js');
var makeAllCardsInfo = require('./makeAllCardsInfo.js');
var makeAllAlgorithmsInfo = require('./makeAllAlgorithmsInfo.js');
var makeAlgoDropdown = require('./makeAlgoDropdown.js');
var makeAllAlgoCondInfo = require('./makeAllAlgoCondInfo.js');
var makeCardDropdown = require('./makeCardDropdown.js');

function typeOf (obj) {
  return {}.toString.call(obj).split(' ')[1].slice(0, -1).toLowerCase();
}

function getDateTime(callback) {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    var current_time = year.toString() + "/" + month.toString() + "/" + day.toString() + 
    		" - " + hour.toString() + ":" + min.toString() + ":" + sec.toString();
    var new_time = current_time.split("'");
    current_time = "";
    for(var i=0;i<new_time.length;i++) current_time += new_time[i];
    new_time = current_time.split('"');
    current_time = "";
    for(var i=0;i<new_time.length;i++) current_time += new_time[i];

    callback(current_time);
}

function getMinute(callback){

	var date = new Date();

	var hour = parseInt(date.getHours());
	var min = parseInt(date.getMinutes());
	//var sec = parseInt(date.getSeconds());
	var year = parseInt(date.getFullYear());
	var month = parseInt(date.getMonth());
	var day = parseInt(date.getDate());

    callback(year*366*24*60 + month*31*24*60 + day*24*60 + hour*60 + min);

}

function getSecond(callback){
	var date = new Date();

	callback(parseInt(date.getSeconds()));
}

var generate = {
	random_string: function(limit,callback){
		var text = "";
	    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	    for( var i=0; i < limit; i++ )
	        text += possible.charAt(Math.floor(Math.random() * possible.length));

	    callback(text);
	},
	random_number: function(limit,callback){
		callback(Math.floor(Math.random() * limit));
	}
};

var card = {
	make: function(level,callback){
		db.query("SELECT * FROM cards WHERE level <= "+level,function(err,cards,fields){
			if(err) throw err;
			var cards_array = [];
			for(var i=0;i<cards.length;i++){
				for(var j=1;j<=cards[i].popularity;j++) cards_array.push(cards[i].cardid);
				if(i==cards.length-1){
					for(var j=cards_array.length;j>0;j--){
						var k = Math.floor(Math.random() * j);
				        var x = cards_array[j - 1];
				        cards_array[j - 1] = cards_array[k];
				        cards_array[k] = x;

				        if(j==1){
				        	generate.random_number(cards_array.length,function(pos){
								callback(cards_array[pos]);
							});
				        }
					}
				}
			}
		});
	},

	update: function(userid,cardid,callback){
		db.query("UPDATE user_cards SET copy = copy+1 WHERE userid = '"+userid+"' AND cardid = "+cardid,function(err,result,fields){
			if(err) throw err;
			db.query("UPDATE users SET current_gift = "+cardid+" WHERE userid = '"+userid+"'",function(err,result,fields){
				if(err) throw err;
				callback();
			});
		});
	},

	erase_gift: function(userid,callback){
		db.query("UPDATE users SET current_gift = null WHERE userid = '"+userid+"'",function(err,result,fields){
			if(err) throw err;
			callback();
		});
	}
}

exports.open_card_effect_links = function(){
	for(var i=0;i<number_of_cards;i++){
		card_effect.push(require('./js/card_effect/card_'+i+'.js'));
	}
}

exports.open_mission_links = function(){
	for(var i=0;i<number_of_missions;i++){
		mission.push(require('./js/missions/mission_'+i+'.js'));
	}
}

function update_algorithm_open_list(userid){
	db.query("SELECT * FROM user_algorithms x WHERE x.userid = '"+userid+
			"' AND NOT EXISTS (SELECT * FROM user_algorithms u, algorithm_conditions a WHERE a.algoid = x.algoid AND u.userid = '"+userid+
			"' AND u.algoid = a.cond_algo AND u.accepted_problems < u.gift_limit)", function(err,algos,fields){
		if(err) throw err;
		for(var i=0;i<algos.length;i++){
			db.query("UPDATE user_algorithms SET opened = true WHERE userid = '"+userid+"' AND algoid = "+algos[i].algoid,function(err,upd,fields){
				if(err) throw err;
			});
		}
	});
}

/////////////////////////// --------------------------------

function refresh_user_cookies(callback){
	getMinute(function(minute){
		db.query("DELETE FROM user_cookies WHERE "+
				minute+"-last_time_used > "+max_cookie_time, function(err,del,fields){
			if(err) throw err;
			callback();
		});
	});
}

exports.check_login = function(req,callback){
	refresh_user_cookies(function(){
		if(!req.cookies || !req.cookies.userid || !req.cookies.num) callback("");
		else{
			db.query("SELECT * FROM user_cookies WHERE userid = '"+req.cookies.userid+
					"' AND cookie = '"+req.cookies.num+"'", function(err,result,fields){
				if(err) throw err;
				else if(result.length == 0) callback("");
				else callback(result[0].userid);
			});
		}
	});
}

exports.update_activity = function(req,userid){
	getMinute(function(current_minute){
		db.query("UPDATE user_cookies SET last_time_used = '"+current_minute+
				"' WHERE userid = '"+userid+"' AND cookie = '"+req.cookies.num+"'",function(err,result,fields){
			if(err) throw err;
		});
		db.query("UPDATE users SET last_online_time = '"+current_minute+
				"' WHERE userid = '"+userid+"'",function(err,result,fields){
			if(err) throw err;
		});
	});
}

function valid_userid(userid){
	if(userid.length>10) return false;
	else{
		for(var i=0;i<userid.length;i++){
			if(!( (userid.charAt(i)>='a' && userid.charAt(i)<='z') || 
				// (userid.charAt(i)>='A' && userid.charAt(i)<='Z') || 
				(userid.charAt(i)>='0' && userid.charAt(i)<='9') ) )
				return false;
		}
		return true;
	}
}

function valid_username(username){
	if(username.length>24) return false;
	else{
		for(var i=0;i<username.length;i++){
			if(!( (username.charAt(i)>='a' && username.charAt(i)<='z') || 
				(username.charAt(i)>='A' && username.charAt(i)<='Z') || 
				(username.charAt(i)>='0' && username.charAt(i)<='9') ||
				username.charAt(i)==' ' || username.charAt(i)=='.' ||
				username.charAt(i)=='_' || username.charAt(i)=='(' || username.charAt(i)==')' || 
				encodeURIComponent(username.charAt(i)).length>3) )
				return false;
		}
		return true;
	}
}

// This function below must be modify after finishing writing the website
function register_new_user(username,userid,password){
	getMinute(function(current_minute){
		getSecond(function(current_second){
			db.query("INSERT INTO users VALUES ('"+
					userid+"','"+username+"','"+password+
					"',null,null,null,0,1,1,null,null,false,null,null,null,null,null,"+(current_minute-1).toString()+","+current_second+")",function(err,results,fields) {
				if (err) throw err;
				// update user_cards
				db.query("SELECT * FROM cards", function(err,cards,fields){
					if(err) throw err;
					for(var i=0;i<cards.length;i++){
						if(cards[i].cardid == 1){
							db.query("INSERT INTO user_cards VALUES ('"+userid+"',"+cards[i].cardid+",'"+
									cards[i].name+"',"+cards[i].level+",1)",function(err,ins,fields){
								if(err) throw err;
							});
						}
						else{
							db.query("INSERT INTO user_cards VALUES ('"+userid+"',"+cards[i].cardid+",'"+
									cards[i].name+"',"+cards[i].level+",0)",function(err,ins,fields){
								if(err) throw err;
							});
						}
					}
				});
				// update user_algorithms
				db.query("SELECT * FROM algorithms", function(err,algos,fields){
					if(err) throw err;

					var cnt = 0;
					for(var i=0;i<algos.length;i++){
						db.query("INSERT INTO user_algorithms VALUES ('"+userid+"',"+algos[i].algoid+",'"+
								algos[i].name+"',false,0,"+algos[i].probs+","+
								algos[i].gift_limit+","+algos[i].level+",false)", function(err,ins,fields){
							if(err) throw err;

							cnt++;
							if(cnt == algos.length) update_algorithm_open_list(userid);
						});
					}
				});
				// update user_problems
				db.query("SELECT * FROM problems", function(err,problems,fields){
					if(err) throw err;
					for(var i=0;i<problems.length;i++){
						db.query("INSERT INTO user_problems VALUES ('"+userid+"','"+problems[i].problemid+"','"+
								problems[i].type+"',0,0,0,'0/0/0',"+problems[i].level+","+problems[i].algorithm+
								",0,0,false,0)", function(err,ins,fields){
							if(err) throw err;
						})
					}
				});
				// update combat_wins
				db.query("INSERT INTO combat_wins VALUES ('"+userid+"',0,0,0,0,0,0)", function(err,results,fields){
					if(err) throw err;
				});
			});
		});
	});
}

exports.signup = function(req,res){
	db.query("SELECT * FROM users WHERE userid = '"+req.body.userid+"'",function(err,user_exists,fields){
		if(user_exists.length == 0 && 
			valid_userid(req.body.userid) && valid_username(req.body.username) &&
			req.body.password.length>0 && req.body.password.length<=200 && req.body.password==req.body.re_password){
			register_new_user(req.body.username,req.body.userid,req.body.password);
			res.redirect("/signup_success.html");
		}
		else res.redirect("/signup_failed.html");
	});
}

exports.login = function(req,res){
	db.query("SELECT * FROM users WHERE userid = '"+req.body.userid+"'", function(err,result,fields){
		if(result.length == 0) res.redirect("/login_failed.html");
		else if(result[0].password != req.body.password) res.redirect("/login_failed.html");
		else{
			generate.random_string(cookie_length,function(code){
				getMinute(function(current_minute){
					db.query("INSERT INTO user_cookies VALUES ('"+
						req.body.userid+"','"+code+"',"+current_minute+")",function(err,result,fields){
						if(err) throw err;
					});
				});

				db.query("SELECT * FROM user_ips WHERE userid = '"+req.body.userid+
						"' AND ip = '"+req.connection.remoteAddress+"'",function(err,ip_exists,fields){
					if(err) throw err;
					else if(ip_exists.length == 0){
						db.query("INSERT INTO user_ips VALUES ('"+
							req.body.userid+"','"+req.connection.remoteAddress+"')",function(err,result,fields){
								if(err) throw err;
						});
					}
				});
				
				res.cookie('userid',req.body.userid);
				res.cookie('num',code);
				res.redirect('/login_success.html');
			});
		}
	});
}

exports.logout = function(req,userid){
	db.query("DELETE FROM user_cookies WHERE userid = '"+userid+
			"' AND cookie = '"+req.cookies.num+"'",function(err,result,fields){
		if(err) throw err;
	});
}

////////////////////////////// --- End of user logging

exports.check_user_exists = function(userid,callback){
	if(userid == "" || userid == null) callback(false);
	else{
		db.query("SELECT * FROM users WHERE userid = '"+userid+"'", function(err,user,fields){
			if(err) throw err;
			if(user.length == 0) callback(false);
			else callback(true);
		});
	}
}

exports.get_username = function(userid,callback){
	db.query("SELECT * FROM users WHERE userid = '"+userid+"'", function(err,user,fields){
		if(err) throw err;
		callback(user[0].username);
	});
}

exports.change_username = function(userid,new_username,callback){
	if(!valid_username(new_username)) callback();
	else db.query("UPDATE users SET username = '"+new_username+"' WHERE userid = '"+userid+"'", function(err,upd,fields){
		if(err) throw err;
		callback();
	});
}

exports.change_password = function(userid,current_password,new_password,retype_password,callback){
	if(new_password != retype_password || new_password.length > 200 || new_password.length == 0) callback(false);
	else{
		db.query("SELECT * FROM users WHERE userid = '"+userid+"' AND password = '"+current_password+"'", function(err,user,fields){
			if(err) throw err;
			if(user.length == 0) callback(false);
			else{
				db.query("UPDATE users SET password = '"+new_password+"' WHERE userid = '"+userid+"'", function(err,upd,fields){
					if(err) throw err;
					callback(true);
				});
			}
		});
	}
}

exports.makeBannerLine = function(req,res){
	makeBannerLine.process(db,function(content){
		res.end(content);
	});
}

exports.makeUsersRanking = function(req,res){
	makeUsersRanking.process(db,function(content){
		res.end(content);
	});
}

exports.makeAllCombats = function(req,res){
	makeAllCombats.process(db,function(content){
		res.end(content);
	});
}

exports.check_card_possession = function(userid,cardid,callback){
	if(parseInt(cardid).toString() == 'NaN') callback(0);
	else db.query("SELECT * FROM user_cards WHERE userid = '"+userid+"' AND cardid = "+cardid,function(err,card,fields){
		if(err) throw err;
		if(card.length == 0) callback(0);
		else callback(card[0].copy);
	});
}

exports.makeUserProfile = function(req,res,userid){
	makeUserProfile.process(db,userid,function(content){
		res.end(content);
	});
}

exports.makeUserProblemsList = function(req,res,userid){
	makeUserProblemsList.process(db,userid,function(content){
		res.end(content);
	});
}

exports.check_algorithm_opened = function(userid,algoid,callback){
	if(parseInt(algoid).toString() == 'NaN') callback(false);
	else{
		db.query("SELECT * FROM user_algorithms WHERE userid = '"+userid+"' AND algoid = "+algoid, function(err,algo,fields){
			if(err) throw err;
			if(algo.length == 0) callback(false);
			else if(algo[0].opened == true) callback(true);
			else callback(false);
		});
	}
}

exports.update_finding_algorithm = function(userid,algoid,callback){
	db.query("UPDATE users SET finding_algorithm = "+algoid+" WHERE userid = '"+userid+"'", function(err,user,fields){
		if(err) throw err;
		callback();
	});
}

exports.check_finding_algorithm = function(userid,callback){
	db.query("SELECT * FROM users WHERE userid = '"+userid+"'", function(err,user,fields){
		if(err) throw err;
		callback(user[0].finding_algorithm);
	});
}

exports.check_number_of_algorithms = function(callback){
	db.query("SELECT * FROM algorithms", function(err,algos,fields){
		if(err) throw err;
		callback(algos.length);
	});
}

exports.check_received_algorithm_gift = function(userid,algoid,callback){
	db.query("SELECT * FROM user_algorithms WHERE userid = '"+userid+"' AND algoid = "+algoid,function(err,algo,fields){
		if(err) throw err;
		if(algo.length == 0) callback(false);
		else if(algo[0].opened == true && algo[0].received_gift == false && 
			algo[0].accepted_problems >= algo[0].gift_limit)
			callback(true);
		else callback(false);
	});
};

exports.makeAlgorithmProblemList = function(req,res,userid,algoid){
	makeAlgorithmProblemList.process(db,userid,algoid,function(content){
		res.end(content);
	});
}

exports.createAlgotrainingGift = function(userid,algoid,callback){
	db.query("SELECT * FROM algorithms WHERE algoid = "+algoid, function(err,algo,fields){
		if(err) throw err;
		card.make(algo[0].level,function(cardid){
			card.update(userid,cardid,function(){
				db.query("UPDATE user_algorithms SET received_gift = true WHERE userid = '"+userid+"' AND algoid = "+algoid,function(err,result,fields){
					if(err) throw err;
					callback();
				});
			});
		})
	});
}

exports.check_current_gift = function(userid,allow_erase,callback){
	db.query("SELECT * FROM users WHERE userid = '"+userid+"'",function(err,user,fields){
		if(err) throw err;
		var current_gift = user[0].current_gift;
		if(allow_erase){
			card.erase_gift(userid,function(){
				if(current_gift != null) callback(current_gift.toString());
				else callback("");
			});
		}
		else{
			if(current_gift != null) callback(current_gift.toString());
			else callback("");
		}
	});
}

exports.check_free_download_solution = function(problemid,callback){
	db.query("SELECT * FROM problems WHERE problemid = '"+problemid+"'", function(err,prob,fields){
		if(err) throw err;
		if(prob.length == 0) callback(false);
		else callback(prob[0].free_solution);
	});
}

exports.check_free_download_testdata = function(problemid,callback){
	db.query("SELECT * FROM problems WHERE problemid = '"+problemid+"'", function(err,prob,fields){
		if(err) throw err;
		if(prob.length == 0) callback(false);
		else callback(prob[0].free_testdata);
	});
}

exports.check_problem_opened = function(userid,problemid,callback){
	db.query("SELECT * FROM problems WHERE problemid = '"+problemid+"'", function(err,origin_prob,fields){
		if(err) throw err;
		if(origin_prob.length == 0) callback(false);
		else if(origin_prob[0].type == 'freetraining') callback(true);
		else if(origin_prob[0].type == 'hidden') callback(true);
		else{
			db.query("SELECT * FROM user_problems WHERE userid = '"+userid+"' AND problemid = '"+problemid+"'", function(err,problem,fields){
				if(err) throw err;
				if(problem.length == 0) callback(false);
				else if(problem[0].type == "combat") callback(false);
				else if(problem[0].type == "freetraining") callback(true);
				else if(problem[0].type == "algotraining"){
					exports.check_algorithm_opened(userid,problem[0].algorithm,function(opened){
						if(!opened) callback(false);
						else callback(true);
					});
				}
			});
		}
	});
}

exports.update_finding_problem = function(userid,problemid,callback){
	db.query("UPDATE users SET finding_problem = '"+problemid+"' WHERE userid = '"+userid+"'", function(err,problem,fields){
		if(err) throw err;
		callback();
	});
}

exports.check_finding_problem = function(userid,callback){
	db.query("SELECT * FROM users WHERE userid = '"+userid+"'", function(err,user,fields){
		if(err) throw err;
		callback(user[0].finding_problem);
	});
}

exports.makeProblemRanking = function(req,res,problemid){
	makeProblemRanking.process(db,problemid,function(content){
		res.end(content);
	});
}

exports.check_time_limit = function(problemid,callback){
	fs.readFile("problems/"+problemid+"/time_limit.txt",function(err,time_limit){
		callback(time_limit);
	});
}

exports.check_memory_limit = function(problemid,callback){
	fs.readFile("problems/"+problemid+"/memory_limit.txt",function(err,memory_limit){
		callback(memory_limit);
	});
}

exports.check_problem_level = function(problemid,callback){
	db.query("SELECT * FROM problems WHERE problemid = '"+problemid+"'", function(err,problem,fields){
		if(err) throw err;
		if(problem.length == 0) callback(-1);
		else callback(problem[0].level);
	});
}

exports.check_current_result = function(userid,problemid,callback){
	db.query("SELECT * FROM user_problems WHERE userid = '"+userid+"' AND problemid = '"+problemid+"'", function(err,problem,fields){
		if(err) throw err;
		if(problem.length == 0) callback(-1);
		else callback(problem[0].current_result);
	});
}

exports.check_max_result = function(userid,problemid,callback){
	db.query("SELECT * FROM user_problems WHERE userid = '"+userid+"' AND problemid = '"+problemid+"'", function(err,problem,fields){
		if(err) throw err;
		if(problem.length == 0) callback(-1);
		else callback(problem[0].max_result);
	});
}

exports.check_max_result_code = function(userid,problemid,callback){
	db.query("SELECT * FROM user_problems WHERE userid = '"+userid+"' AND problemid = '"+problemid+"'", function(err,problem,fields){
		if(err) throw err;
		if(problem.length == 0) callback(0);
		else callback(problem[0].max_result_code);
	});
}

exports.check_grading_code = function(userid,problemid,callback){
	db.query("SELECT * FROM user_problems WHERE userid = '"+userid+"' AND problemid = '"+problemid+"'", function(err,problem,fields){
		if(err) throw err;
		if(problem.length == 0) callback(-1);
		else callback(problem[0].grading_code);
	});
}

exports.check_grading_num = function(userid,problemid,callback){
	db.query("SELECT * FROM user_problems WHERE userid = '"+userid+"' AND problemid = '"+problemid+"'", function(err,problem,fields){
		if(err) throw err;
		if(problem.length == 0) callback(-1);
		else callback(problem[0].grading_num);
	});
}

exports.check_problem_source = function(problemid,callback){
	db.query("SELECT * FROM problems WHERE problemid = '"+problemid+"'", function(err,problem,fields){
		if(err) throw err;
		if(problem.length == 0) callback('');
		else callback(problem[0].source);
	});
}

exports.check_received_freetraining_gift = function(userid,problemid,callback){
	db.query("SELECT * FROM user_problems WHERE userid = '"+userid+"' AND problemid = '"+problemid+"'", function(err,problem,fields){
		if(err) throw err;
		if(problem.length == 0) callback(false);
		else if(problem[0].type == "freetraining" && 
				problem[0].received_gift == false &&
				problem[0].max_result == 100){
			callback(true);
		}
		else callback(false);
	});
};

exports.createFreetrainingGift = function(userid,problemid,callback){
	db.query("SELECT * FROM problems WHERE problemid = '"+problemid+"'", function(err,problem,fields){
		if(err) throw err;
		card.make(problem[0].level+1,function(cardid){
			card.update(userid,cardid,function(){
				db.query("UPDATE user_problems SET received_gift = true WHERE userid = '"+userid+"' AND problemid = '"+problemid+"'",function(err,result,fields){
					if(err) throw err;
					callback();
				});
			});
		})
	});
}

exports.check_received_mission_gift = function(userid,index,callback){
	if(parseInt(index).toString() == "NaN" || parseInt(index)<0 || parseInt(index)>=number_of_missions) callback(false);
	else mission[index].check_allow_receive_gift(db,userid,function(allow_receive){
		callback(allow_receive);
	});
}

exports.createMissionGift = function(userid,index,callback){
	mission[index].make_gift(db,userid,function(gift_cardid){
		card.update(userid,gift_cardid,function(){
			callback();
		});
	});
}

exports.check_allow_submit = function(userid,callback){
	getMinute(function(current_minute){
		getSecond(function(current_second){
			db.query("SELECT * FROM users WHERE userid = '"+userid+"'", function(err,user,fields){
				if(err) throw err;
				if(user.length == 0) callback(false);
				else if((current_minute-user[0].last_submit_minute)*60+
						(current_second-user[0].last_submit_second)<60) callback(false);
				else callback(true);
			});
		});
	});
}

exports.noncombat_grading = function(userid,problemid,language,source_code){
	getMinute(function(current_minute){
		getSecond(function(current_second){
			db.query("UPDATE users SET last_submit_minute = "+current_minute+", last_submit_second = "+current_second+
					" WHERE userid = '"+userid+"'", function(err,upd,fields){
				if(err) throw err;

				db.query("SELECT * FROM user_problems WHERE userid = '"+userid+"' AND problemid = '"+problemid+"'", function(err,problem,fields){
					if(err) throw err;
					
					var max_result = problem[0].max_result;
					var max_running_time = problem[0].running_time;
					var type = problem[0].type;
					var algorithm = problem[0].algorithm;

					var grading_num = problem[0].grading_num + 1;
					var grading_code = problem[0].grading_code + 1;
					db.query("UPDATE user_problems SET grading_num = "+grading_num+", grading_code = "+grading_code+
							" WHERE userid = '"+userid+"' AND problemid = '"+problemid+"'",function(err,result,fields){
						if(err) throw err;

						judge.process(userid,problemid,grading_num,language,source_code,function(result,running_time){
							db.query("UPDATE user_problems SET grading_code = grading_code-1, current_result = "+result+
									", max_result = "+Math.max(result,max_result)+
									" WHERE userid = '"+userid+"' AND problemid = '"+problemid+"'", function(err,upd,fields){
								if(err) throw err;
								if(grading_num == 1 || result > max_result || (result == max_result && running_time < max_running_time)){
									getDateTime(function(current_time){
										db.query("UPDATE user_problems SET max_result_time = '"+current_time+"', running_time = "+running_time+", max_result_code = "+grading_num+
												" WHERE userid = '"+userid+"' AND problemid = '"+problemid+"'", function(err,upd,fields){
											if(err) throw err;
										})
									});
								}
							});

							if(type=="algotraining" && Math.max(result,max_result)==100 && max_result<100){
								db.query("SELECT * FROM user_algorithms WHERE userid = '"+userid+"' AND algoid = "+algorithm, function(err,algo,fields){
									var accepted_problems = algo[0].accepted_problems + 1;
									var unaccepted_problems = algo[0].unaccepted_problems - 1;
									var gift_limit = algo[0].gift_limit;

									db.query("UPDATE user_algorithms SET accepted_problems = "+accepted_problems+", unaccepted_problems = "+unaccepted_problems+
											" WHERE userid = '"+userid+"' AND algoid = "+algorithm, function(err,upd,fields){
										if(err) throw err;
									});

									if(accepted_problems == gift_limit) update_algorithm_open_list(userid);
								});
							}
						});
					});
				});
			});
		});
	});
}

exports.makeFreetrainingProblemList = function(req,res,userid){
	makeFreetrainingProblemList.process(db,userid,function(content){
		res.end(content);
	});
}

exports.makeMissionsList = function(req,res,userid){
	makeMissionsList.process(db,userid,function(content){
		res.end(content);
	});
}

/////////// ------ COMBAT PAGE !!!

exports.update_card_using = function(userid,cardid){
	db.query("UPDATE users SET card_using = "+cardid+" WHERE userid = '"+userid+"'", function(err,upd,fields){
		if(err) throw err;
	});
}

exports.check_card_using = function(userid,callback){
	db.query("SELECT * FROM users WHERE userid = '"+userid+"'", function(err,user,fields){
		if(err) throw err;
		callback(user[0].card_using);
	});
}

exports.update_choose_problem_level = function(userid,level){
	db.query("UPDATE users SET problem_level = "+level+" WHERE userid = '"+userid+"'", function(err,upd,fields){
		if(err) throw err;
	});
}

exports.check_choose_problem_level = function(userid,callback){
	db.query("SELECT * FROM users WHERE userid = '"+userid+"'", function(err,user,fields){
		if(err) throw err;
		callback(user[0].problem_level);
	});
}

exports.check_combat_exists = function(combatid,callback){
	db.query("SELECT * FROM combats WHERE combatid = '"+combatid+"'", function(err,combat,fields){
		if(err) throw err;
		if(combat.length == 0) callback(false);
		else callback(true);
	});
}

exports.update_finding_combat = function(userid,combatid,callback){
	db.query("UPDATE users SET finding_combat = '"+combatid+"', next_combat = null WHERE userid = '"+userid+"'", function(err,upd,fields){
		if(err) throw err;
		callback();
	});
}

exports.check_next_combat = function(userid,callback){
	db.query("SELECT * FROM users WHERE userid = '"+userid+"'", function(err,user,fields){
		if(err) throw err;
		var next_combat = user[0].next_combat;
		if(next_combat!=null && next_combat.indexOf(" ")!=-1){
			db.query("UPDATE users SET next_combat = null WHERE userid = '"+userid+"'",function(err,upd,fields){
				if(err) throw err;
			});
		}
		callback(next_combat);
	});
}

exports.check_block_challenge = function(userid,callback){
	db.query("SELECT * FROM users WHERE userid = '"+userid+"'", function(err,user,fields){
		if(err) throw err;
		callback(user[0].block_challenge);
	});
}

exports.check_having_combat = function(userid,callback){
	getMinute(function(minute){
		getSecond(function(second){
			db.query("SELECT * FROM combats WHERE userid = '"+userid+
					"' ORDER BY start_minute DESC, start_second DESC",function(err,combats,fields){
				if(err) throw err;
				if(combats.length == 0) callback(null);
				else if(!combats[0].ended) callback(combats[0].combatid);
				else if(!combats[0].added_to_freetraining) callback(combats[0].combatid);
				else callback(null);
			});
		});
	});
}

exports.makeUsersStatus = function(req,res,userid){
	getMinute(function(minute){
		makeUsersStatus.process(db,userid,minute,function(content){
			res.end(content);
		});
	});
}

exports.makeUserCombats = function(req,res,userid,mine){
	makeUserCombats.process(db,userid,mine,function(content){
		res.end(content);
	});
}

exports.create_combat_request = function(userid,callback){
	getMinute(function(minute){
		getSecond(function(second){
			db.query("SELECT * FROM users WHERE userid = '"+userid+"'", function(err,user,fields){
				if(err) throw err;
				db.query("SELECT * FROM combat_requests WHERE userid = '"+userid+"'", function(err,request,fields){
					if(err) throw err;
					if(request.length == 0){
						db.query("INSERT INTO combat_requests VALUES ('"+userid+"',"+
								user[0].card_using+","+user[0].problem_level+","+minute+","+second+")", function(err,ins,fields){
							if(err) throw err;
							callback();
						});
					}
					else{
						db.query("UPDATE combat_requests SET card_using = "+user[0].card_using+
								", problem_level = "+user[0].problem_level+
								", minute = "+minute+", second = "+second+" WHERE userid = '"+userid+"'", function(err,upd,fields){
							if(err) throw err;
							callback();
						});
					}
				});
			});
		});
	});
}

exports.stop_combat_request = function(userid,callback){
	getMinute(function(minute){
		db.query("SELECT * FROM combat_requests WHERE userid = '"+userid+"'", function(err,request,fields){
			if(err) throw err;
			if(request.length == 0) callback();
			else{
				var rollback_time = minute - 10;
				db.query("UPDATE combat_requests SET minute = "+rollback_time+" WHERE userid = '"+userid+"'", function(err,upd,fields){
					if(err) throw err;
					callback();
				});
			}
		});
	});
}

exports.block_all_challenge = function(userid,callback){
	db.query("UPDATE users SET block_challenge = true WHERE userid = '"+userid+"'", function(err,upd,fields){
		if(err) throw err;
		callback();
	});
}

exports.unblock_all_challenge = function(userid,callback){
	db.query("UPDATE users SET block_challenge = false WHERE userid = '"+userid+"'", function(err,upd,fields){
		if(err) throw err;
		callback();
	});
}

exports.block_challenge = function(userid,blockid,callback){
	db.query("SELECT * FROM block_list WHERE userid = '"+userid+"' AND blockid = '"+blockid+"'", function(err,results,fields){
		if(err) throw err;
		if(results.length == 0){
			db.query("INSERT INTO block_list VALUES ('"+userid+"','"+blockid+"')", function(err,ins,fields){
				if(err) throw err;
				callback();
			});
		}
		else callback();
	})
}

exports.unblock_challenge = function(userid,blockid,callback){
	db.query("DELETE FROM block_list WHERE userid = '"+userid+"' AND blockid = '"+blockid+"'", function(err,del,fields){
		if(err) throw err;
		callback();
	});
}

exports.make_challenge = function(userid,oppid,callback){
	if(userid == oppid) callback("You cannot challenge yourself!");
	else{
		db.query("SELECT * FROM block_list WHERE userid = '"+oppid+"' AND blockid = '"+userid+"'", function(err,result,fields){
			if(err) throw err;
			if(result.length != 0) callback("You are blocked by this user!");
			else{
				getMinute(function(minute){
					getSecond(function(second){
						db.query("SELECT * FROM users WHERE userid = '"+oppid+"'", function(err,opp,fields){
							if(err) throw err;
							if(opp[0].challenge_minute == null || 
								(minute-opp[0].challenge_minute)*60+(second-opp[0].challenge_second)>max_challenge_time){
								db.query("SELECT * FROM users WHERE userid = '"+userid+"'", function(err,user,fields){
									if(err) throw err;
									if(user[0].card_using == -1) callback("You did not choose any card to play with!");
									else{
										db.query("UPDATE users SET challenge_oppid = '"+userid+"', challenge_level = "+user[0].problem_level+", challenge_minute = "+minute+
												", challenge_second = "+second+", challenge_read = false WHERE userid = '"+oppid+"'", function(err,upd,fields){
											if(err) throw err;
											callback("");
										});
									}
								});
							}
							else callback("");
						});
					});
				});
			}
		});
	}
}

exports.get_challenge = function(userid,callback){
	db.query("SELECT * FROM users WHERE userid = '"+userid+"'", function(err,user,fields){
		if(err) throw err;
		if(user[0].block_challenge) callback('',-1);
		else if(user[0].challenge_oppid == null) callback('',-1);
		else if(user[0].challenge_read) callback('',-1);
		// else if(user[0].card_using == -1) callback('',-1);
		else{
			db.query("UPDATE users SET challenge_read = true WHERE userid = '"+userid+"'", function(err,upd,fields){
				if(err) throw err;
				getMinute(function(minute){
					getSecond(function(second){
						if((minute-user[0].challenge_minute)*60+(second-user[0].challenge_second)>max_challenge_time)
							callback('',-1);
						else callback(user[0].challenge_oppid,user[0].challenge_level);
					});
				});
			});
		}
	});
}

exports.check_finding_combat = function(userid,callback){
	db.query("SELECT * FROM users WHERE userid = '"+userid+"'", function(err,user,fields){
		if(err) throw err;
		callback(user[0].finding_combat);
	});
}

exports.get_combat_problem = function(combatid,callback){
	db.query("SELECT * FROM combats WHERE combatid = '"+combatid+"'", function(err,combat,fields){
		if(err) throw err;
		if(combat.length == 0) callback("");
		else callback(combat[0].problemid);
	});
}

exports.get_combat_score = function(userid,combatid,callback){
	db.query("SELECT * FROM combats WHERE combatid = '"+combatid+"'", function(err,combat,fields){
		if(err) throw err;
		if(combat.length == 0) callback(-INF);
		else if(combat[0].userid == userid) callback(combat[0].original_score + combat[0].card_score + combat[0].bonus_score + combat[0].virtual_score);
		else if(combat[1].userid == userid) callback(combat[1].original_score + combat[1].card_score + combat[1].bonus_score + combat[1].virtual_score);
		else callback(combat[0].original_score + combat[0].card_score + combat[0].bonus_score + combat[0].virtual_score);
	});
}

exports.get_combat_oppscore = function(userid,combatid,callback){
	db.query("SELECT * FROM combats WHERE combatid = '"+combatid+"'", function(err,combat,fields){
		if(err) throw err;
		if(combat.length == 0) callback(-INF);
		else if(combat[0].userid == userid) callback(combat[1].original_score + combat[1].card_score + combat[1].bonus_score + combat[1].virtual_score);
		else if(combat[1].userid == userid) callback(combat[0].original_score + combat[0].card_score + combat[0].bonus_score + combat[0].virtual_score);
		else callback(combat[1].original_score + combat[1].card_score + combat[1].bonus_score + combat[1].virtual_score);
	});
}

exports.get_combat_original_score = function(userid,combatid,callback){
	db.query("SELECT * FROM combats WHERE combatid = '"+combatid+"'", function(err,combat,fields){
		if(err) throw err;
		if(combat.length == 0) callback(-INF);
		else if(combat[0].userid == userid) callback(combat[0].original_score);
		else if(combat[1].userid == userid) callback(combat[1].original_score);
		else callback(combat[0].original_score);
	});
}

exports.get_combat_opponent_original_score = function(userid,combatid,callback){
	db.query("SELECT * FROM combats WHERE combatid = '"+combatid+"'", function(err,combat,fields){
		if(err) throw err;
		if(combat.length == 0) callback(-INF);
		else if(combat[0].userid == userid) callback(combat[1].original_score);
		else if(combat[1].userid == userid) callback(combat[0].original_score);
		else callback(combat[1].original_score);
	});
}

function update_ended_combat(combatid,callback){
	db.query("UPDATE combats SET ended = true WHERE combatid = '"+combatid+"'", function(err,upd,fields){
		if(err) throw err;
		callback();
	});
}

exports.get_combat_time = function(combatid,callback){
	// callback(minute,second)
	// minute, second:
	// return -2 : waiting time
	// return -1 : full time (finished)
	// return 0 -> 60 : time

	db.query("SELECT * FROM combats WHERE combatid = '"+combatid+"'", function(err,player,fields){
		if(err) throw err;
		if(player.length == 0) callback(-2,-2);
		else getMinute(function(minute){
			getSecond(function(second){
				var all_seconds = (minute-player[0].start_minute)*60+(second-player[0].start_second);
				var combat_minute = Math.floor(all_seconds/60), combat_second = all_seconds%60;
				if(player[0].ended) callback(-1,-1);
				else if(combat_minute >= Math.max(player[0].max_time,player[1].max_time)+judging_time){
					update_ended_combat(combatid,function(){
						callback(-1,-1);
					});
				}
				else if(combat_minute >= Math.max(player[0].max_time,player[1].max_time)) callback(-2,-2);
				else if(player[0].original_score == 100 || player[1].original_score == 100){
					if(combat_minute >= Math.max(player[0].last_submit_minute,player[1].last_submit_minute)+judging_time){
						update_ended_combat(combatid,function(){
							callback(-1,-1);
						});
					}
					else callback(-2,-2);
				}
				else if(player[0].dead_time <= combat_minute && player[0].original_score < player[0].dead_score){
					if(player[0].dead_time+judging_time <= combat_minute){
						update_ended_combat(combatid,function(){
							callback(-1,-1);
						});
					}
					else callback(-2,-2);
				}
				else if(player[1].dead_time <= combat_minute && player[1].original_score < player[1].dead_score){
					if(player[1].dead_time+judging_time <= combat_minute){
						update_ended_combat(combatid,function(){
							callback(-1,-1);
						});
					}
					else callback(-2,-2);
				}
				else callback(combat_minute,combat_second);
			});
		});
	});
}

exports.get_combat_minute = function(combatid,callback){
	exports.get_combat_time(combatid,function(minute,second){
		callback(minute);
	});
}

exports.get_combat_second = function(combatid,callback){
	exports.get_combat_time(combatid,function(minute,second){
		callback(second);
	});
}

exports.get_combat_message = function(userid,combatid,callback){
	db.query("SELECT * FROM combats WHERE userid = '"+userid+"' AND combatid = '"+combatid+"'", function(err,combat,fields){
		if(err) throw err;
		if(combat.length == 0) callback("");
		else {
			var message = combat[0].message;
			db.query("UPDATE combats SET message = '' WHERE userid = '"+userid+"' AND combatid = '"+combatid+"'", function(err,upd,fields){
				if(err) throw err;
				callback(message);
			});
		}
	});
}

exports.get_combat_myid = function(userid,combatid,callback){
	db.query("SELECT * FROM combats WHERE combatid = '"+combatid+"'", function(err,combat,fields){
		if(err) throw err;
		if(combat.length == 0) callback("undefined");
		else if(combat[0].userid == userid || combat[0].oppid == userid) callback(userid);
		else callback(combat[0].userid);
	});
}

exports.get_combat_oppid = function(userid,combatid,callback){
	db.query("SELECT * FROM combats WHERE combatid = '"+combatid+"'", function(err,combat,fields){
		if(err) throw err;
		if(combat.length == 0) callback("undefined");
		else if(combat[0].userid == userid) callback(combat[0].oppid);
		else if(combat[1].userid == userid) callback(combat[1].oppid);
		else callback(combat[0].oppid);
	});
}

exports.get_combat_mycard = function(userid,combatid,callback){
	db.query("SELECT * FROM combats WHERE combatid = '"+combatid+"'", function(err,combat,fields){
		if(err) throw err;
		if(combat.length == 0) callback(-1);
		else if(combat[0].userid == userid) callback(combat[0].card_using);
		else if(combat[1].userid == userid) callback(combat[1].card_using);
		else callback(combat[0].card_using);
	});
}

exports.get_combat_oppcard = function(userid,combatid,callback){
	db.query("SELECT * FROM combats WHERE combatid = '"+combatid+"'", function(err,combat,fields){
		if(err) throw err;
		if(combat.length == 0) callback(-1);
		else if(combat[0].userid == userid) callback(combat[1].card_using);
		else if(combat[1].userid == userid) callback(combat[0].card_using);
		else callback(combat[1].card_using);
	});
}

exports.get_combat_level = function(combatid,callback){
	db.query("SELECT * FROM combats WHERE combatid = '"+combatid+"'", function(err,combat,fields){
		if(err) throw err;
		if(combat.length == 0) callback(-1);
		else callback(combat[0].problem_level);
	});
}

exports.get_combat_grading_code = function(userid,combatid,callback){
	db.query("SELECT * FROM combats WHERE userid = '"+userid+"' AND combatid = '"+combatid+"'", function(err,combat,fields){
		if(err) throw err;
		if(combat.length == 0) callback(0);
		else callback(combat[0].grading_code);
	});
}

exports.get_combat_grading_num = function(userid,combatid,callback){
	db.query("SELECT * FROM combats WHERE userid = '"+userid+"' AND combatid = '"+combatid+"'", function(err,combat,fields){
		if(err) throw err;
		if(combat.length == 0) callback(0);
		else callback(combat[0].grading_num);
	});
}

exports.get_combat_submit_left = function(userid,combatid,callback){
	db.query("SELECT * FROM combats WHERE userid = '"+userid+"' AND combatid = '"+combatid+"'", function(err,combat,fields){
		if(err) throw err;
		if(combat.length == 0) callback(0);
		else callback(combat[0].submit_left);
	});
}

exports.check_combat_download_solution = function(userid,combatid,callback){
	db.query("SELECT * FROM combats WHERE userid = '"+userid+"' AND combatid = '"+combatid+"'", function(err,player,fields){
		if(err) throw err;
		if(player.length == 0) callback(false);
		else{
			exports.get_combat_time(combatid,function(minute,second){
				if(minute>=player[0].solution_time) callback(true);
				else callback(false);
			});
		}
	});
}

exports.check_combat_change_problem = function(userid,combatid,callback){
	db.query("SELECT * FROM combats WHERE userid = '"+userid+"' AND combatid = '"+combatid+"'", function(err,player,fields){
		if(err) throw err;
		if(player.length == 0) callback(false);
		else{
			exports.get_combat_time(combatid,function(minute,second){
				if(minute>=0 && minute<player[0].change_problem_time && player[0].ingame_active) callback(true);
				else callback(false);
			});
		}
	});
}

exports.change_combat_problem = function(userid,combatid,callback){
	db.query("SELECT * FROM combats WHERE combatid = '"+combatid+"'", function(err,player,fields){
		if(err) throw err;

		var problem_level = player[0].problem_level;
		var oppid = (player[0].userid == userid) ? player[1].userid : player[0].userid;
		db.query("SELECT p.problemid FROM problems p, user_problems a, user_problems b WHERE a.userid = '"+
				player[0].userid+"' AND b.userid = '"+player[1].userid+
				"' AND a.type = 'combat' AND b.type = 'combat'"+
				" AND p.problemid = a.problemid AND p.problemid = b.problemid AND p.level = "+problem_level, function(err,problems,fields){
			if(err) throw err;

			generate.random_number(problems.length,function(i){
				var problemid = problems[i].problemid;
				db.query("UPDATE combats SET ingame_active = false WHERE combatid = '"+combatid+"' AND userid = '"+userid+"'", function(err,upd,fields){
					if(err) throw err;

					db.query("UPDATE combats SET problemid = '"+problemid+"' WHERE combatid = '"+combatid+"'", function(err,upd,fields){
						if(err) throw err;

						db.query("UPDATE combats SET message = 'Your opponent changed the problem, please reload to see.' WHERE userid = '"+oppid+
								"' AND combatid = '"+combatid+"'", function(err,upd,fields){
							if(err) throw err;

							callback();
						});
					});
				});
			});
		});
	});
}

exports.check_allow_read_combat_problem = function(userid,combatid,callback){
	exports.get_combat_time(combatid,function(minute,second){
		if(minute == -1 || minute == -2) callback(true);
		else{
			db.query("SELECT * FROM combats WHERE userid = '"+userid+
				"' AND combatid = '"+combatid+"'", function(err,combat,fields){
				if(err) throw err;
				if(combat.length == 0){
					if(userid == "admin") callback(true);
					else{
						db.query("SELECT * FROM combats WHERE combatid = '"+combatid+"'", function(err,result,fields){
							if(err) throw err;
							if(Math.max(result[0].lock_problemset_time,result[1].lock_problemset_time)>minute) callback(false);
							else callback(true);
						});
					}
				}
				else if(combat[0].lock_problemset_time > minute) callback(false);
				else callback(true);
			});
		}
	});
}

exports.check_combat_allow_submit = function(userid,combatid,callback){
	exports.get_combat_time(combatid,function(minute,second){
		if(minute == -1 || minute == -2) callback(false);
		else db.query("SELECT * FROM combats WHERE userid = '"+userid+
			"' AND combatid = '"+combatid+"'", function(err,user,fields){
			if(err) throw err;
			if(user.length == 0) callback(false);
			else if(user[0].max_time <= minute) callback(false);
			else if(user[0].submit_left == 0) callback(false);
			else callback(true);
		});
	});
}

exports.combat_grading = function(userid,combatid,language,source_code){
	getMinute(function(current_minute){
		getSecond(function(current_second){
			db.query("UPDATE users SET last_submit_minute = "+current_minute+", last_submit_second = "+current_second+
					" WHERE userid = '"+userid+"'", function(err,upd,fields){
				if(err) throw err;

				db.query("SELECT * FROM combats WHERE userid = '"+userid+"' AND combatid = '"+combatid+"'", function(err,player,fields){
					if(err) throw err;

					getDateTime(function(current_time){
						exports.get_combat_time(combatid,function(minute,second){

							var problemid = player[0].problemid;
							var oppid = player[0].oppid;
							var original_score = player[0].original_score;
							var card_score = player[0].card_score;
							var bonus_score = player[0].bonus_score;
							var virtual_score = player[0].virtual_score;
							var bonus_time = player[0].bonuspoint_time;
							var bonus_coef = player[0].bonus_coefficient;
							var dead_score = player[0].dead_score;
							var grading_num = player[0].grading_num+1;

							var last_score = player[0].original_score;
							var last_running_time = player[0].running_time;

							db.query("UPDATE combats SET grading_num = grading_num+1, grading_code = grading_code+1, submit_left=submit_left-1, "+
									"last_submit_time = '"+current_time+"', last_submit_minute = "+minute+", last_submit_second = "+second+
									" WHERE userid = '"+userid+"' AND combatid = '"+combatid+"'",function(err,upd,fields){
								if(err) throw err;

								judge.process(userid,problemid,grading_num,language,source_code,function(current_score,running_time){
									if(current_score > original_score) original_score = current_score;
									if(minute < bonus_time) bonus_score = bonus_coef*original_score;
									db.query("UPDATE combats SET grading_code = grading_code-1, current_score = "+current_score+
											", original_score = "+original_score+", bonus_score = "+bonus_score+
											" WHERE userid = '"+userid+"' AND combatid = '"+combatid+"'", function(err,upd,fields){
										if(err) throw err;
										if(original_score > last_score || (original_score == last_score && last_running_time > running_time)){
											db.query("UPDATE combats SET running_time = "+running_time+", max_score_code = "+grading_num+
													" WHERE userid = '"+userid+"' AND combatid = '"+combatid+"'", function(err,upd,fields){
												if(err) throw err;
											});
										}
										if(original_score >= dead_score){
											db.query("UPDATE combats SET virtual_score = 0 WHERE userid = '"+oppid+
													"' AND combatid = '"+combatid+"'",function(err,upd,fields){
												if(err) throw err;
											});
										}
									});
								});
							});

						});
					});
				});
			});
		});
	});
}

exports.get_combat_winner = function(combatid,callback){
	exports.get_combat_time(combatid,function(minute,second){
		if(minute != -1) callback("");
		else db.query("SELECT * FROM combats WHERE combatid = '"+combatid+"'", function(err,player,fields){
			if(err) throw err;
			if(player[0].original_score == 100 && player[1].original_score == 100){
				if(player[0].last_submit_time == player[1].last_submit_time) callback("");
				else if(player[0].last_submit_time < player[1].last_submit_time) callback(player[0].userid);
				else callback(player[1].userid);
			}
			else if(player[0].original_score == 100) callback(player[0].userid);
			else if(player[1].original_score == 100) callback(player[1].userid);
			else{
				exports.get_combat_score(player[0].userid,combatid,function(player0_score){
					exports.get_combat_score(player[1].userid,combatid,function(player1_score){
						if(player0_score > INF/2 && player1_score > INF/2){
							if(player[0].dead_time == player[1].dead_time) callback("");
							else if(player[0].dead_time > player[1].dead_time) callback(player[0].userid);
							else callback(player[1].userid);
						}
						else if(player0_score > player1_score) callback(player[0].userid);
						else if(player0_score < player1_score) callback(player[1].userid);
						else callback("");
					});
				});
			}
		});
	});
}

exports.check_received_combat_gift = function(userid,combatid,callback){
	exports.get_combat_winner(combatid,function(winner){
		if(winner != userid) callback(false);
		else db.query("SELECT * FROM combats WHERE userid = '"+userid+
				"' AND combatid = '"+combatid+"'", function(err,user,fields){
			if(err) throw err;
			if(user[0].original_score < minimum_combat_gift_score 
				&& user[0].card_using != 0) // special card for admin
				callback(false);
			else if(user[0].received_gift == false) callback(true);
			else callback(false);
		});
	});
}

exports.createCombatGift = function(userid,combatid,callback){
	db.query("SELECT * FROM combats WHERE combatid = '"+combatid+"'", function(err,player,fields){
		if(err) throw err;
		if(player[0].userid != userid){
			var temp = player[0]; 
			player[0] = player[1]; 
			player[1] = temp;
		}
		card_effect[player[0].card_using].affect_post_game(player[1].card_using,player[1].card_level,player[0].problem_level,function(gift_cardid,gift_level){
			if(gift_cardid == -2){
				card.update(userid,-1,function(){
					db.query("UPDATE combats SET received_gift = true WHERE userid = '"+userid+"' AND combatid = '"+combatid+"'",function(err,result,fields){
						if(err) throw err;
						callback();
					});
				});
			}
			else if(gift_cardid >= 0){
				card.update(userid,gift_cardid,function(){
					db.query("UPDATE users SET card_using = -1 WHERE userid = '"+player[1].userid+"'", function(err,upd,fields){
						if(err) throw err;
						db.query("UPDATE user_cards SET copy = 0 WHERE userid = '"+player[1].userid+"' AND cardid = "+gift_cardid+" AND copy>0", function(err,upd,fields){
							if(err) throw err;
							db.query("UPDATE combats SET received_gift = true WHERE userid = '"+userid+"' AND combatid = '"+combatid+"'",function(err,result,fields){
								if(err) throw err;
								callback();
							});
						});
					});
				});
			}
			else{
				var level_decrease = (player[0].challenge==true) ? 1 : 0;
				card.make(gift_level-level_decrease,function(cardid){
					card.update(userid,cardid,function(){
						db.query("UPDATE combats SET received_gift = true WHERE userid = '"+userid+"' AND combatid = '"+combatid+"'",function(err,result,fields){
							if(err) throw err;
							callback();
						});
					});
				});
			}
		});
	});
}

exports.check_add_to_freetraining = function(userid,combatid,callback){
	db.query("SELECT * FROM combats WHERE userid = '"+userid+
			"' AND combatid = '"+combatid+"'", function(err,user,fields){
		if(err) throw err;
		if(user.length == 0) callback(false);
		else if(user[0].added_to_freetraining) callback(false);
		else{
			exports.get_combat_time(combatid,function(minute,second){
				if(minute != -1) callback(false);
				else{
					exports.get_combat_winner(combatid,function(winner){
						if(winner != userid) callback(true);
						else if(user[0].original_score < minimum_combat_gift_score
								&& user[0].card_using != 0) // special card for admin
								callback(true);
						else if(user[0].received_gift) callback(true);
						else callback(false);
					});
				}
			});
		}
	});
}

function add_to_combat_wins(userid,combatid){
	db.query("UPDATE combat_wins SET win = win+1 WHERE userid = '"+userid+"'", function(err,upd,fields){
		if(err) throw err;

		db.query("SELECT * FROM combats WHERE userid = '"+userid+"' AND combatid = '"+combatid+"'", function(err,user,fields){
			if(err) throw err;
			if(user[0].original_score == 100){
				if(user[0].grading_num == 1){
					db.query("UPDATE combat_wins SET one_submit = one_submit+1 WHERE userid = '"+userid+"'", function(err,upd,fields){
						if(err) throw err;
					});
				}
				if(user[0].problem_level == 3){
					db.query("UPDATE combat_wins SET level_three = level_three+1 WHERE userid = '"+userid+"'", function(err,upd,fields){
						if(err) throw err;
					});
				}
				if(user[0].card_level == 1){
					db.query("UPDATE combat_wins SET one_star = one_star+1 WHERE userid = '"+userid+"'", function(err,upd,fields){
						if(err) throw err;
					});
				}
				if(user[0].last_submit_minute < 30){
					db.query("UPDATE combat_wins SET half_hour = half_hour+1 WHERE userid = '"+userid+"'", function(err,upd,fields){
						if(err) throw err;
					});
				}
			}
		});
	});
}

exports.add_to_freetraining = function(req,res,userid,combatid){
	db.query("SELECT * FROM combats WHERE userid = '"+userid+
			"' AND combatid = '"+combatid+"'", function(err,combat,fields){
		if(err) throw err;
		db.query("UPDATE user_problems SET type = 'freetraining', current_result = "+combat[0].current_score+
				", max_result = "+combat[0].original_score+", running_time = "+combat[0].running_time.toString()+
				", max_result_time = '"+combat[0].last_submit_time+
				"', grading_num = "+combat[0].grading_num+", grading_code = "+combat[0].grading_code+
				", received_gift = "+combat[0].received_gift+", max_result_code = "+combat[0].max_score_code+
				" WHERE userid = '"+userid+"' AND problemid = '"+combat[0].problemid+"'", function(err,upd,fields){
			if(err) throw err;
			db.query("UPDATE combats SET added_to_freetraining = true WHERE userid = '"+userid+
					"' AND combatid = '"+combatid+"'", function(err,upd,fields){
				if(err) throw err;

				exports.get_combat_winner(combatid,function(winner){
					if(winner == userid) add_to_combat_wins(userid,combatid);
				});

				res.redirect("/add_to_freetraining_success.html");
			});
		});
	});
}

function make_combat(player1,player2,problem_level,cardid1,cardid2,start_time,start_minute,start_second,challenge){
	generate.random_string(combatid_length,function(combatid){
		db.query("SELECT p.problemid FROM problems p, user_problems a, user_problems b WHERE a.userid = '"+
				player1+"' AND b.userid = '"+player2+
				"' AND a.type = 'combat' AND b.type = 'combat'"+
				" AND p.problemid = a.problemid AND p.problemid = b.problemid AND p.level = "+problem_level, function(err,problems,fields){
			if(err) throw err;
			if(problems.length > 0){
				generate.random_number(problems.length,function(i){
					var problemid = problems[i].problemid;
					db.query("UPDATE users SET next_combat = '"+combatid+"' WHERE userid = '"+player1+"' OR userid = '"+player2+"'", function(err,upd,fields){
						if(err) throw err;
						db.query("SELECT * FROM cards WHERE cardid = "+cardid1, function(err,card1,fields){
							if(err) throw err;

							card_effect[cardid1].affect_player_pregame(cardid2,function(submit_left1,max_time1,lock_problemset_time1,dead_time1,dead_score1,card_score1,virtual_score1,ingame_active1,bonuspoint_time1,bonus_coefficient1,solution_time1,change_problem_time1){
								card_effect[cardid2].affect_opponent_pregame(cardid1,function(submit_left2,max_time2,lock_problemset_time2,dead_time2,dead_score2,card_score2,virtual_score2,ingame_active2,bonuspoint_time2,bonus_coefficient2,solution_time2,change_problem_time2){

									var card_level = card1[0].level;
									var submit_left = default_submit_left+submit_left1+submit_left2;
									var max_time = Math.min(max_time1,max_time2);
									var lock_problemset_time = Math.max(lock_problemset_time1,lock_problemset_time2);
									var dead_time = Math.min(dead_time1,dead_time2);
									var dead_score = Math.max(dead_score1,dead_score2);
									var card_score = card_score1+card_score2;
									var virtual_score = Math.max(virtual_score1,virtual_score2);
									var ingame_active = (ingame_active1||ingame_active2);
									var bonuspoint_time = Math.max(bonuspoint_time1,bonuspoint_time2);
									var bonus_coefficient = Math.max(bonus_coefficient1,bonus_coefficient2);
									var solution_time = Math.min(solution_time1,solution_time2);
									var change_problem_time = Math.max(change_problem_time1,change_problem_time2);

									db.query("INSERT INTO combats VALUES ('"+combatid+"','"+player1+"','"+player2+"','"+start_time+"',"+start_minute+","+start_second+","
											+challenge+","+cardid1+","+card_level+",'"+problemid+"',"+problem_level+",0,0,"+submit_left+","+max_time+","+lock_problemset_time
											+","+dead_time+","+dead_score+",0,0,"+card_score+",0,"+virtual_score+",0,"+ingame_active.toString()+","
											+bonuspoint_time+","+bonus_coefficient+","+solution_time+","+change_problem_time+",'0/0/0',-1,-1,false,false,'',false,0)", function(err,ins,fields){
										if(err) throw err;
									});
								});
							});
						});

						db.query("SELECT * FROM cards WHERE cardid = "+cardid2, function(err,card2,fields){
							if(err) throw err;

							card_effect[cardid2].affect_player_pregame(cardid1,function(submit_left1,max_time1,lock_problemset_time1,dead_time1,dead_score1,card_score1,virtual_score1,ingame_active1,bonuspoint_time1,bonus_coefficient1,solution_time1,change_problem_time1){
								card_effect[cardid1].affect_opponent_pregame(cardid2,function(submit_left2,max_time2,lock_problemset_time2,dead_time2,dead_score2,card_score2,virtual_score2,ingame_active2,bonuspoint_time2,bonus_coefficient2,solution_time2,change_problem_time2){

									var card_level = card2[0].level;
									var submit_left = default_submit_left+submit_left1+submit_left2;
									var max_time = Math.min(max_time1,max_time2);
									var lock_problemset_time = Math.max(lock_problemset_time1,lock_problemset_time2);
									var dead_time = Math.min(dead_time1,dead_time2);
									var dead_score = Math.max(dead_score1,dead_score2);
									var card_score = card_score1+card_score2;
									var virtual_score = Math.max(virtual_score1,virtual_score2);
									var ingame_active = (ingame_active1||ingame_active2);
									var bonuspoint_time = Math.max(bonuspoint_time1,bonuspoint_time2);
									var bonus_coefficient = Math.max(bonus_coefficient1,bonus_coefficient2);
									var solution_time = Math.min(solution_time1,solution_time2);
									var change_problem_time = Math.max(change_problem_time1,change_problem_time2);

									db.query("INSERT INTO combats VALUES ('"+combatid+"','"+player2+"','"+player1+"','"+start_time+"',"+start_minute+","+start_second+","
											+challenge+","+cardid2+","+card_level+",'"+problemid+"',"+problem_level+",0,0,"+submit_left+","+max_time+","+lock_problemset_time
											+","+dead_time+","+dead_score+",0,0,"+card_score+",0,"+virtual_score+",0,"+ingame_active.toString()+","
											+bonuspoint_time+","+bonus_coefficient+","+solution_time+","+change_problem_time+",'0/0/0',-1,-1,false,false,'',false,0)", function(err,ins,fields){
										if(err) throw err;
									});
								});
							});
						});

					});
				});
			}
		});
	});
}

exports.accept_challenge = function(userid,oppid,callback){
	db.query("SELECT * FROM users WHERE userid = '"+userid+"'", function(err,user,fields){
		if(err) throw err;
		if(user[0].challenge_oppid != oppid) callback("Request timeout!");
		else if(user[0].card_using == -1) callback("You did not choose any card to play with!");
		else{
			getDateTime(function(current_time){
				getMinute(function(minute){
					getSecond(function(second){
						if((minute-user[0].challenge_minute)*60+(second-user[0].challenge_second)>max_challenge_time)
							callback("Request timeout!");
						else{
							db.query("SELECT * FROM combats WHERE ended = false AND (userid = '"+userid+"' OR userid = '"+oppid+
									"') ORDER BY start_minute DESC, start_second DESC", function(err,combats,fields){
								if(err) throw err;
								if(combats.length == 0){
									db.query("SELECT * FROM users WHERE userid = '"+oppid+"'", function(err,opp,fields){
										if(err) throw err;
										make_combat(userid,oppid,
											user[0].challenge_level,user[0].card_using,opp[0].card_using,
											current_time,minute,second,true);
										callback("Accept challenge successfully! Click 'OK' and wait for a moment.");
									});
								}
								else callback("You or your opponent is having another combat!");
							});
						}
					});
				});
			});
		}
	});
}

exports.add_custom_combat = function(player1id,player2id,level,callback){
	if(player1id == player2id) callback("Players are the same!");
	else{
		db.query("SELECT * FROM users WHERE userid = '"+player1id+"'", function(err,player1,fields){
			if(err) throw err;
			if(player1.length == 0) callback("Player1 does not exist!");
			else{
				db.query("SELECT * FROM users WHERE userid = '"+player2id+"'", function(err,player2,fields){
					if(err) throw err;
					if(player2.length == 0) callback("Player2 does not exist!");
					else{
						exports.check_having_combat(player1id,function(combat1id){
							if(combat1id != null) callback(player1id+" is still having another combat!");
							else{
								exports.check_having_combat(player2id,function(combat2id){
									if(combat2id != null) callback(player2id+" is still having another combat!");
									else{
										if(player1[0].card_using == -1) callback(player1id+" did not choose card!");
										else if(player2[0].card_using == -1) callback(player2id+" did not choose card!");
										else{
											getDateTime(function(current_time){
												getMinute(function(minute){
													getSecond(function(second){
														make_combat(player1id,player2id,parseInt(level),
															player1[0].card_using,player2[0].card_using,
															current_time,minute,second,false);
														callback("");
													});
												});
											});
										}
									}
								})
							}
						});
					}
				});
			}
		});
	}
}

///////////// ADMIN PAGE

exports.check_judging_submissions = function(callback){
	db.query("SELECT SUM(grading_code) AS num FROM user_problems", function(err,probs,fields){
		if(err) throw err;
		if(probs[0].num > 0) callback("YES");
		else{
			db.query("SELECT SUM(grading_code) AS num FROM combats", function(err,coms,fields){
				if(err) throw err;
				if(coms[0].num > 0) callback("YES");
				else callback("NO");
			});
		}
	});
}

exports.delete_logs = function(callback){
	exec("rm -rf logs/*",function(){
		callback();
	});
}

exports.combat_generator_open = function(callback){
	combat_generator = setInterval(function() {
		getDateTime(function(current_time){
			getMinute(function(minute){
				getSecond(function(second){
					db.query("DELETE FROM combat_requests WHERE ("+
							minute+"-minute)*60+("+second+"-second) > 7", function(err,del,fields){
						if(err) throw err;
						for(var prob_lv=1;prob_lv<=3;prob_lv++){
							db.query("SELECT * FROM combat_requests WHERE problem_level = "+
									prob_lv+" ORDER BY minute, second",function(err,requests,fields){
								if(err) throw err;
								if(requests.length >= 2){
									db.query("SELECT * FROM combats WHERE ended = false AND (userid = '"+requests[0].userid+
											"' OR userid = '"+requests[1].userid+"') ORDER BY start_minute DESC, start_second DESC", function(err,combats,fields){
										if(err) throw err;
										if(combats.length == 0){
											make_combat(requests[0].userid,requests[1].userid,
												requests[0].problem_level,requests[0].card_using,requests[1].card_using,
												current_time,minute,second,false);
										}
									});
								}
							});
						}
					});
				});
			});
		});
	}, 5000);
	callback();
}

exports.combat_generator_close = function(callback){
	clearInterval(combat_generator);
	callback();
}

exports.random_three_cards = function(userid,callback){
	var content = "";
	generate.random_number(number_of_cards-1,function(card1id){
		card1id++;
		content += "<img src='../admin/cards/"+card1id+"' class='card'>\n";
		generate.random_number(number_of_cards-1,function(card2id){
			card2id++;
			content += "<img src='../admin/cards/"+card2id+"' class='card'>\n";
			generate.random_number(number_of_cards-1,function(card3id){
				card3id++;
				content += "<img src='../admin/cards/"+card3id+"' class='card'>\n";
				db.query("UPDATE user_cards SET copy = 0 WHERE userid = '"+userid+"'", function(err,upd,fields){
					if(err) throw err;
					db.query("UPDATE user_cards SET copy = 1 WHERE userid = '"+userid+
							"' AND (cardid = "+card1id+" OR cardid = "+card2id+" OR cardid = "+card3id+")", function(err,upd,fields){
						if(err) throw err;
						db.query("UPDATE users SET card_using = -1 WHERE userid = '"+userid+"'", function(err,upd,fields){
							if(err) throw err;
							callback(content);
						});
					});
				});
			});
		});
	});
}

exports.delete_all_cookies = function(req,res){
	db.query("DELETE FROM user_cookies WHERE userid <> 'admin' OR cookie <> '"+
			req.cookies.num+"'", function(err,result,fields){
		if(err) throw err;
		else res.redirect("/deletedAllCookies.html");
	});
}

exports.delete_an_user = function(req,res,userid){
	db.query("DELETE FROM combat_wins WHERE userid = '"+userid+"'",function(err,result,fields){
		if(err) throw err;
		db.query("DELETE FROM combats WHERE userid = '"+userid+"' OR oppid = '"+userid+"'",function(err,result,fields){
			if(err) throw err;
			db.query("DELETE FROM user_cookies WHERE userid = '"+userid+"'",function(err,result,fields){
				if(err) throw err;
				db.query("DELETE FROM user_ips WHERE userid = '"+userid+"'",function(err,result,fields){
					if(err) throw err;
					db.query("DELETE FROM user_cards WHERE userid = '"+userid+"'",function(err,result,fields){
						if(err) throw err;
						db.query("DELETE FROM user_algorithms WHERE userid = '"+userid+"'",function(err,result,fields){
							if(err) throw err;
							db.query("DELETE FROM user_problems WHERE userid = '"+userid+"'",function(err,result,fields){
								if(err) throw err;
								db.query("DELETE FROM users WHERE userid = '"+userid+"'",function(err,result,fields){
									if(err) throw err;
									res.redirect("/deletedAnUser.html");
								});
							});
						});
					});
				});
			});
		});
	});
}

exports.makeCardDropdown = function(req,res){
	makeCardDropdown.process(db,function(content){
		res.end(content);
	});
}

function valid_cardname(cardname){
	if(cardname == '') return false;
	if(cardname.length>45) return false;
	else{
		for(var i=0;i<cardname.length;i++){
			if(!( (cardname.charAt(i)>='A' && cardname.charAt(i)<='Z') || 
				(cardname.charAt(i)>='a' && cardname.charAt(i)<='z') || 
				(cardname.charAt(i)>='0' && cardname.charAt(i)<='9') ||
				cardname.charAt(i)==' ' || cardname.charAt(i)=='-' ||
				cardname.charAt(i)=='(' || cardname.charAt(i)==')' ||
				encodeURIComponent(cardname.charAt(i)).length>3) )
				return false;
		}
		return true;
	}
}

exports.add_card = function(req,res,cardname,level){
	db.query("SELECT MAX(cardid) AS max_cardid FROM cards", function(err,num,fields){
		if(err) throw err;

		if(!valid_cardname(cardname)) res.redirect("/addCard_failed.html");
		else{
			var cardid = (num[0].max_cardid == null) ? 0 : (num[0].max_cardid + 1);
			var popularity;
			if(level=="0") popularity = 0;
			if(level=="1") popularity = 1;
			if(level=="2") popularity = 16;
			if(level=="3") popularity = 8;
			if(level=="4") popularity = 4;
			if(level=="5") popularity = 2;

			db.query("INSERT INTO cards VALUES ("+
					cardid+",'"+cardname+"',"+level+","+popularity+")",function(err,result,fields){
				if(err) throw err;
				db.query("SELECT * FROM users", function(err,users,fields){
					if(err) throw err;
					for(var i=0;i<users.length;i++){
						db.query("INSERT INTO user_cards VALUES ('"+users[i].userid+"',"+cardid+",'"+
								cardname+"',"+level+",0)",function(err,result,fields){
							if(err) throw err;
						});
					}
					res.redirect("/addCard_success.html");
				});
			});
		}
	});
}

exports.delete_card = function(req,res,cardid){
	db.query("SELECT * FROM cards WHERE cardid = "+cardid,function(err,result,fields){
		if(err) throw err;
		if(result.length == 0) res.redirect("/deleteCard_failed.html");
		else{
			db.query("DELETE FROM user_cards WHERE cardid = "+cardid,function(err,result,fields){
				if(err) throw err;
				db.query("DELETE FROM cards WHERE cardid = "+cardid,function(err,result,fields){
					if(err) throw err;
					res.redirect("/deleteCard_success.html");
				});
			});
		}
	});
}

exports.makeAllCardsInfo = function(req,res){
	makeAllCardsInfo.process(db,function(content){
		res.end(content);
	});
}

function valid_problemid(problemid){
	if(problemid == '') return false;
	if(problemid.length>7) return false;
	else{
		for(var i=0;i<problemid.length;i++){
			if(!( (problemid.charAt(i)>='A' && problemid.charAt(i)<='Z') || 
				(problemid.charAt(i)>='0' && problemid.charAt(i)<='9') ) )
				return false;
		}
		return true;
	}
}

function valid_problemType(problemType){
	if(problemType!="algotraining" && problemType!="freetraining" && 
		problemType!="combat" && problemType!="hidden")
		return false;
	else return true;
}

exports.add_problem = function(req,res,problemid,problemType,level,algorithm,source){
	db.query("SELECT * FROM problems WHERE problemid = '"+problemid+"'",function(err,problem_exists,fields){
		if(err) throw err;
		else if(problem_exists.length!=0) res.redirect("/addProblem_failed.html");
		else if(!valid_problemid(problemid)) res.redirect("/addProblem_failed.html");
		else if(!valid_problemType(problemType)) res.redirect("/addProblem_failed.html");
		else if(!fs.existsSync("problems/"+problemid)) res.redirect("/addProblem_failed.html");
		else{
			var algo = parseInt(algorithm);
			if(algo==0 && problemType=="algotraining") res.redirect("/addProblem_failed.html");
			else if(algo!=0 && problemType!="algotraining") res.redirect("/addProblem_failed.html");
			else{
				if(algo==0) algo = null;
				if(source == null || source == '') source = "none";
				if(algo!=null){
					db.query("UPDATE algorithms SET probs = probs+1 WHERE algoid = "+algo, function(err,upd,fields){
						if(err) throw err;
					});
					db.query("UPDATE user_algorithms SET unaccepted_problems = unaccepted_problems+1 WHERE algoid = "+
							algo,function(err,upd,fields){
						if(err) throw err;
					});
				}
				db.query("INSERT INTO problems VALUES ('"+
						problemid+"','"+problemType+"',"+level+","+algo+",'"+source+"',false,false)",function(err,result,fields){
					if(err) throw err;
					db.query("SELECT * FROM users", function(err,users,fields){
						if(err) throw err;
						for(var i=0;i<users.length;i++){
							db.query("INSERT INTO user_problems VALUES ('"+users[i].userid+"','"+problemid+"','"+
									problemType+"',0,0,0,'0/0/0',"+level+","+algo+",0,0,false,0)",function(err,result,fields){
								if(err) throw err;
							});
						}
						res.redirect("/addProblem_success.html");
					});
				});
			}
		}
	});
}

function refresh_user_algorithms(algoid){
	// update accepted_problems
	db.query("SELECT * FROM users", function(err,users,fields){
		if(err) throw err;
		for(var i=0;i<users.length;i++){
			db.query("UPDATE user_algorithms SET accepted_problems = (SELECT COUNT(*) FROM user_problems WHERE userid = '"+
					users[i].userid+"' AND algorithm = "+algoid+" AND max_result = 100) WHERE userid = '"+
					users[i].userid+"' AND algoid = "+algoid, function(err,upd,fields){
				if(err) throw err;
			});
		}
	});
	// update unaccepted_problems
	db.query("SELECT * FROM users", function(err,users,fields){
		if(err) throw err;
		for(var i=0;i<users.length;i++){
			db.query("UPDATE user_algorithms SET unaccepted_problems = (SELECT COUNT(*) FROM user_problems WHERE userid = '"+
					users[i].userid+"' AND algorithm = "+algoid+" AND max_result <> 100) WHERE userid = '"+
					users[i].userid+"' AND algoid = "+algoid, function(err,upd,fields){
				if(err) throw err;
			});
		}
	});
}

exports.delete_problem = function(req,res,problemid){
	db.query("SELECT * FROM problems WHERE problemid = '"+problemid+"'",function(err,result,fields){
		if(err) throw err;
		if(result.length == 0) res.redirect("/deleteProblem_failed.html");
		else{
			var algo = result[0].algorithm; if(algo == null) algo = -1;
			db.query("DELETE FROM combats WHERE problemid = '"+problemid+"'",function(err,del,fields){
				if(err) throw err;
				db.query("UPDATE algorithms SET probs = probs-1 WHERE algoid = "+algo,function(err,upd,fields){
					if(err) throw err;
					db.query("DELETE FROM user_problems WHERE problemid = '"+problemid+"'",function(err,del,fields){
						if(err) throw err;
						db.query("DELETE FROM problems WHERE problemid = '"+problemid+"'",function(err,del,fields){
							if(err) throw err;
							refresh_user_algorithms(algo);
							res.redirect("/deleteProblem_success.html");
						});
					});
				});
			});
		}
	});
}

function valid_algoname(algoname){
	if(algoname == '') return false;
	if(algoname.length>45) return false;
	else{
		for(var i=0;i<algoname.length;i++){
			if(!( (algoname.charAt(i)>='A' && algoname.charAt(i)<='Z') || 
				(algoname.charAt(i)>='a' && algoname.charAt(i)<='z') || 
				(algoname.charAt(i)>='0' && algoname.charAt(i)<='9') ||
				algoname.charAt(i)==' ' || algoname.charAt(i)=='-' || algoname.charAt(i)=='&') )
				return false;
		}
		return true;
	}
}

exports.add_algorithm = function(req,res,algoname,gift_limit,level){
	db.query("SELECT MAX(algoid) AS max_algoid FROM algorithms", function(err,num,fields){
		if(err) throw err;

		if(!valid_algoname(algoname)) res.redirect("/addAlgorithm_failed.html");
		else if(gift_limit=="" || parseInt(gift_limit).toString()=='NaN' || parseInt(gift_limit)<1) res.redirect("/addAlgorithm_failed.html");
		else{
			var algoid = (num[0].max_algoid == null) ? 1 : (num[0].max_algoid + 1);
			db.query("INSERT INTO algorithms VALUES ("+
					algoid+",'"+algoname+"',"+gift_limit+","+level+",0)",function(err,result,fields){
				if(err) throw err;
				db.query("SELECT * FROM users", function(err,users,fields){
					if(err) throw err;
					for(var i=0;i<users.length;i++){
						db.query("INSERT INTO user_algorithms VALUES ('"+users[i].userid+"',"+algoid+",'"+
								algoname+"',false,0,0,"+gift_limit+","+level+",false)",function(err,result,fields){
							if(err) throw err;
						});
					}
					res.redirect("/addAlgorithm_success.html");
				});
			});
		}
	});
}

exports.makeAlgoDropdown = function(req,res){
	makeAlgoDropdown.process(db,function(content){
		res.end(content);
	});
}

exports.delete_algorithm = function(req,res,algorithm){
	db.query("SELECT * FROM algorithms WHERE algoid = "+algorithm,function(err,result,fields){
		if(err) throw err;
		if(result.length == 0) res.redirect("/deleteAlgorithm_failed.html");
		else{
			db.query("UPDATE problems SET algorithm = null, type = 'hidden' WHERE algorithm = "+algorithm,function(err,result,fields){
				if(err) throw err;
				db.query("UPDATE user_problems SET algorithm = null, type = 'hidden' WHERE algorithm = "+algorithm,function(err,result,fields){
					if(err) throw err;
					db.query("DELETE FROM user_algorithms WHERE algoid = "+algorithm,function(err,result,fields){
						if(err) throw err;
						db.query("DELETE FROM algorithm_conditions WHERE algoid = "+algorithm+" OR cond_algo = "+algorithm,function(err,result,fields){
							if(err) throw err;
							db.query("DELETE FROM algorithms WHERE algoid = "+algorithm,function(err,result,fields){
								if(err) throw err;
								res.redirect("/deleteAlgorithm_success.html");
							});
						});
					});
				});
			});
		}
	});
}

exports.makeAllAlgorithmsInfo = function(req,res){
	makeAllAlgorithmsInfo.process(db,function(content){
		res.end(content);
	});
}

exports.makeAllAlgoCondInfo = function(req,res){
	makeAllAlgoCondInfo.process(db,function(content){
		res.end(content);
	});
}

exports.add_algocond = function(req,res,algoid,cond_algo){
	if(algoid=="0" || cond_algo=="0" || algoid==cond_algo) res.redirect("/addAlgoCond_failed.html");
	else{
		db.query("SELECT * FROM algorithm_conditions WHERE algoid = "+algoid+" AND cond_algo = "+cond_algo,function(err,result,fields){
			if(err) throw err;
			if(result.length!=0) res.redirect("/addAlgoCond_failed.html");
			else{
				db.query("INSERT INTO algorithm_conditions VALUES ("+algoid+","+cond_algo+")",function(err,result,fields){
					if(err) throw err;
					res.redirect("/addAlgoCond_success.html");
				});
			}
		});
	}
}

exports.delete_algocond = function(req,res,algoid,cond_algo){
	db.query("SELECT * FROM algorithm_conditions WHERE algoid = "+algoid+" AND cond_algo = "+cond_algo,function(err,result,fields){
		if(err) throw err;
		if(result.length==0) res.redirect("/deleteAlgoCond_failed.html");
		else{
			db.query("DELETE FROM algorithm_conditions WHERE algoid = "+algoid+" AND cond_algo = "+cond_algo,function(err,result,fields){
				if(err) throw err;
				res.redirect("/deleteAlgoCond_success.html");
			});
		}
	});
}