var http = require('http');
var fs = require('fs');
var path = require('path');
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var exec = require('child_process').exec;
var assert = require('assert');
var app = express();
var cookieParser = require('cookie-parser');

var hostname = "172.31.26.13"; //172.31.26.13
var port = 8888;

var action = require('./action.js');
var cards_description = require('./js/cards_description.js').card;

var extensions = ['.html', '.css', '.js', '.jpg', '.png', '.gif', '.mp3', '.mp4', '.ico', '.txt', '.pdf', '.zip'];

var code_language = ['cpp', 'pas'];

var forbid = ['/algorithm_server.js', '/action.js', '/mysql_queries.txt',
				'/makeUsersRanking.js', '/makeUserProfile.js', '/makeAllCombats.js', '/makeUserCombats.js',
				'/makeAlgoProblemList.js', '/makeFreetrainingProblemList.js', '/makeUserProblemsList.js',
				'/makeProblemRanking.js', '/makeMissionsList.js', '/makeAlgoDropdown.js', '/makeAllAlgoCond.js',
				'/makeCardDropDown.js', '/makeAllCardsInfo.js', '/makeAllAlgorithmsInfo.js', '/makeUsersStatus.js',
				'/CODECARD.zip', '/judge.cpp', '/judge.js', '/judge_cpp.js', '/judge_pas.js'];

var finding_user = '';
var anonymous_finding_problem = 'A';
var anonymous_finding_combat = '';
var challenge_status = true;

// app.use(morgan('dev')); // to print action to console in a pretty form

app.use(bodyParser());
app.use(bodyParser.json()); // if request body has json data, 
// then convert it to a simpler form to use in javascript

app.use(cookieParser()); // secret key

action.open_card_effect_links();
action.open_mission_links();

action.combat_generator_open(function(){
	console.log("combat generator opened!");
});

var remove_logs = setInterval(function(){
	action.check_judging_submissions(function(judging_submissions){
		if(judging_submissions == "NO"){
			action.delete_logs(function(){});
		}
	});
}, 2000);

var check_login = function(req,callback){
	action.check_login(req,function(userid){
		callback(userid);
	});
};

function update_activity(req,res,next){
	check_login(req,function(userid){
		if(userid!=""){
			action.update_activity(req,userid);
			console.log("'"+ userid + "' request for " + req.url + ' by method ' + req.method);
		}
		else console.log('IP ' + req.connection.remoteAddress + ' request for ' + req.url + ' by method ' + req.method);
	});
	next();
}

function check_invalid_input(req,res,next){
	if(req.url.indexOf('"')>-1 || req.url.indexOf("'")>-1) res.end("Request contains invalid character!");
	else if(req.body != undefined){
		if(req.body.userid != undefined && (req.body.userid.indexOf('"')>-1 || req.body.userid.indexOf("'")>-1)) res.end("Request contains invalid character!");
		else if(req.body.username != undefined && (req.body.username.indexOf('"')>-1 || req.body.username.indexOf("'")>-1)) res.end("Request contains invalid character!");
		else if(req.body.current_password != undefined && (req.body.current_password.indexOf('"')>-1 || req.body.current_password.indexOf("'")>-1)) res.end("Request contains invalid character!");
		else if(req.body.password != undefined && (req.body.password.indexOf('"')>-1 || req.body.password.indexOf("'")>-1)) res.end("Request contains invalid character!");
		else if(req.body.re_password != undefined && (req.body.re_password.indexOf('"')>-1 || req.body.re_password.indexOf("'")>-1)) res.end("Request contains invalid character!");
		else if(req.body.cardname != undefined && (req.body.cardname.indexOf('"')>-1 || req.body.cardname.indexOf("'")>-1)) res.end("Request contains invalid character!");
		else if(req.body.player1 != undefined && (req.body.player1.indexOf('"')>-1 || req.body.player1.indexOf("'")>-1)) res.end("Request contains invalid character!");
		else if(req.body.player2 != undefined && (req.body.player2.indexOf('"')>-1 || req.body.player2.indexOf("'")>-1)) res.end("Request contains invalid character!");
		else if(req.body.level != undefined && (req.body.level.indexOf('"')>-1 || req.body.level.indexOf("'")>-1)) res.end("Request contains invalid character!");
		else if(req.body.cardid != undefined && (req.body.cardid.indexOf('"')>-1 || req.body.cardid.indexOf("'")>-1)) res.end("Request contains invalid character!");
		else if(req.body.problemid != undefined && (req.body.problemid.indexOf('"')>-1 || req.body.problemid.indexOf("'")>-1)) res.end("Request contains invalid character!");
		else if(req.body.type != undefined && (req.body.type.indexOf('"')>-1 || req.body.type.indexOf("'")>-1)) res.end("Request contains invalid character!");
		else if(req.body.algorithm != undefined && (req.body.algorithm.indexOf('"')>-1 || req.body.algorithm.indexOf("'")>-1)) res.end("Request contains invalid character!");
		else if(req.body.source != undefined && (req.body.source.indexOf('"')>-1 || req.body.source.indexOf("'")>-1)) res.end("Request contains invalid character!");
		else if(req.body.algoname != undefined && (req.body.algoname.indexOf('"')>-1 || req.body.algoname.indexOf("'")>-1)) res.end("Request contains invalid character!");
		else if(req.body.gift_limit != undefined && (req.body.gift_limit.indexOf('"')>-1 || req.body.gift_limit.indexOf("'")>-1)) res.end("Request contains invalid character!");
		else if(req.body.algoid != undefined && (req.body.algoid.indexOf('"')>-1 || req.body.algoid.indexOf("'")>-1)) res.end("Request contains invalid character!");
		else if(req.body.cond_algo != undefined && (req.body.cond_algo.indexOf('"')>-1 || req.body.cond_algo.indexOf("'")>-1)) res.end("Request contains invalid character!");
		else next();
	}
	else next();
}

function givefile(req,res,fileUrl){
	var filePath = path.resolve('.'+fileUrl);
	var fileExt = path.extname(filePath);

	fs.exists(filePath, function(exists){
		if(extensions.indexOf(fileExt)==-1) res.redirect("/");
		else if(!exists) res.redirect("/");
		else if(forbid.indexOf(fileUrl)!=-1) res.redirect("/");
		else fs.createReadStream(filePath).pipe(res);
	});
}

function get_code_language(language,callback){
	callback(language);
}

function givecode(req,res,fileUrl){
	var filePath = path.resolve('.'+fileUrl);

	for(var i=0;i<code_language.length;i++){
		//console.log(filePath+'.'+code_language[i]+" "+code_language[i]);
		get_code_language(code_language[i],function(language){
			fs.exists(filePath+'.'+language, function(exists){
				if(exists) fs.createReadStream(filePath+'.'+language).pipe(res);
			});
		});
	}
}

app.use(update_activity);
app.use(check_invalid_input);

app.get('/', function(req,res){
	givefile(req,res,'/index.html');
});

app.get('/index.html', function(req,res){
	res.redirect("/");
});

app.get('/gallery', function(req,res){
	givefile(req,res,'/gallery.html');
});

app.get('/gallery.html', function(req,res){
	res.redirect("/");
});

app.get('/introduction', function(req,res){
	givefile(req,res,'/introduction.html');
});

app.get('/introduction.html', function(req,res){
	res.redirect("/");
});

app.get('/admin', function(req,res){
	check_login(req,function(userid){
		if(userid=="admin") givefile(req,res,'/admin.html');
		else res.redirect("/");
	});
});

app.get('/admin.html', function(req,res){
	res.redirect("/");
});

app.get('/livestream', function(req,res){
	check_login(req,function(userid){
		if(userid=="admin") givefile(req,res,'/livestream.html');
		else res.redirect("/");
	});
});

app.get('/livestream.html', function(req,res){
	res.redirect("/");
});

app.get('/login', function(req,res){
	check_login(req,function(userid){
		if(userid=="") givefile(req,res,'/login.html');
		else res.redirect("/");
	});
});

app.get('/login.html', function(req,res){
	res.redirect("/");
});

app.get('/signup', function(req,res){
	check_login(req,function(userid){
		if(userid=="") givefile(req,res,'/signup.html');
		else res.redirect("/");
	});
});

app.get('/signup.html', function(req,res){
	res.redirect("/");
});

app.get('/user_ranking', function(req,res){
	action.makeUsersRanking(req,res);
});

app.get('/userid', function(req,res){
	check_login(req,function(userid){
		res.end(userid);
	});
});

app.get('/username', function(req,res){
	check_login(req,function(userid){
		if(userid == "") res.end("");
		else action.get_username(userid,function(username){
			res.end(username);
		});
	});
});

app.get('/user.html', function(req,res){
	res.redirect("/");
});

app.get('/user/:userid', function(req,res){
	action.check_user_exists(req.params.userid,function(user_exists){
		if(!user_exists) res.end("User does not exists!");
		else{
			finding_user = req.params.userid;
			givefile(req,res,"/user.html");
		}
	});
});

app.get('/finding_user', function(req,res){
	res.end(finding_user);
});

app.get('/getUserProfile/:userid', function(req,res){
	action.check_user_exists(req.params.userid,function(user_exists){
		if(!user_exists) res.end("User does not exist!");
		else action.makeUserProfile(req,res,req.params.userid);
	});
});

app.get('/get_all_problems_list/:userid', function(req,res){
	action.check_user_exists(req.params.userid,function(user_exists){
		if(!user_exists) res.end("User does not exists!");
		else action.makeUserProblemsList(req,res,req.params.userid);
	});
});

app.get('/get_banner_line', function(req,res){
	action.makeBannerLine(req,res);
});

app.get('/get_all_combats', function(req,res){
	action.makeAllCombats(req,res);
});

app.get("/profile", function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.redirect("/login_require.html");
		else givefile(req,res,'/profile.html');
	});
});

app.get('/profile.html', function(req,res){
	res.redirect("/");
});

//////////////// -- Algorithm Training

app.get('/algotraining', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.redirect("/login_require.html");
		else givefile(req,res,'/algotraining.html');
	});
});

app.get('/algotraining.html', function(req,res){
	res.redirect("/");
});

app.get('/algopage.html', function(req,res){
	res.redirect("/");
});

app.get('/algotraining/finding_algorithm', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.redirect("/login_require.html");
		else action.check_finding_algorithm(userid,function(algoId){
			if(algoId != null) res.end(algoId.toString());
			else res.end("");
		});
	});
});

app.get('/algotraining/getNumberOfAlgorithms', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.redirect("/login_require.html");
		else action.check_number_of_algorithms(function(numberOfAlgorithms){
			res.end(numberOfAlgorithms.toString());
		});
	});
});

app.get('/algotraining/getAlgoProblemList/:algoId', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.redirect("/login_require.html");
		else{
			action.check_algorithm_opened(userid,req.params.algoId,function(opened){
				if(!opened) res.end("You did not unlock this algorithm!");
				else action.makeAlgorithmProblemList(req,res,userid,req.params.algoId);
			});
		}
	});
});

app.get('/algotraining/check_algorithm_opened/:algoId', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.end("NO");
		else{
			action.check_algorithm_opened(userid,req.params.algoId,function(opened){
				if(!opened) res.end("NO");
				else res.end("YES");
			});
		}
	});
});

app.get('/algotraining/gift/:algoId', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.redirect("/login_require.html");
		else{
			action.check_received_algorithm_gift(userid,req.params.algoId,function(allow_receive){
				if(!allow_receive) res.redirect("/algorithm_gift_receive_failed.html");
				else action.createAlgotrainingGift(userid,req.params.algoId,function(){
					res.redirect("/gift");
				});
			});
		}
	});
});

app.get('/algotraining/:algoId', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.redirect("/login_require.html");
		else{
			action.check_algorithm_opened(userid,req.params.algoId,function(opened){
				if(!opened) res.redirect("/algorithm_unlock_require.html");
				else{
					action.update_finding_algorithm(userid,req.params.algoId,function(){
						givefile(req,res,'/algopage.html');
					});
				}
			});
		}
	});
});

app.get('/problem.html', function(req,res){
	res.redirect("/");
});

app.get('/problem/finding_problem', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.end(anonymous_finding_problem);
		else action.check_finding_problem(userid,function(problemId){
			if(problemId != null) res.end(problemId.toString());
			else res.end("");
		});
	});
});

app.get('/problem/:problemId/code/:userid', function(req,res){
	check_login(req,function(userid){
		action.check_problem_opened(userid,req.params.problemId,function(opened){
			if(!opened && userid!='admin') res.redirect("/problem_locked.html");
			else action.check_max_result_code(req.params.userid,req.params.problemId,function(code){
				if(code == 0) res.end("Code does not exist!");
				else givecode(req,res,'/code/'+req.params.problemId+'_'+req.params.userid+'_'+code);
			});
		});
	});
});

app.get('/problem/:problemId/getProblemRanking', function(req,res){
	check_login(req,function(userid){
		action.check_problem_opened(userid,req.params.problemId,function(opened){
			if(!opened) res.redirect("/problem_locked.html");
			else action.makeProblemRanking(req,res,req.params.problemId);
		});
	});
});

app.get('/problem/:problemId/level', function(req,res){
	check_login(req,function(userid){
		action.check_problem_opened(userid,req.params.problemId,function(opened){
			if(!opened) res.redirect("/problem_locked.html");
			else action.check_problem_level(req.params.problemId,function(problem_level){
				res.end(problem_level.toString());
			});
		});
	});
});

app.get('/problem/:problemId/current_result', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.end("0");
		else action.check_current_result(userid,req.params.problemId,function(current_result){
			res.end(current_result.toString());
		});
	});
});

app.get('/problem/:problemId/max_result', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.end("0");
		else action.check_max_result(userid,req.params.problemId,function(max_result){
			res.end(max_result.toString());
		});
	});
});

app.get('/problem/:problemId/grading_code', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.end("0");
		else action.check_grading_code(userid,req.params.problemId,function(grading_code){
			res.end(grading_code.toString());
		});
	});
});

app.get('/problem/:problemId/grading_num', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.end("0");
		else action.check_grading_num(userid,req.params.problemId,function(grading_num){
			res.end(grading_num.toString());
		});
	});
});

app.get('/problem/:problemId/grading_log', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.end("");
		else{
			var filePath = './results/'+req.params.problemId+"_"+userid+".log";
			fs.exists(filePath, function(exists){
				if(!exists) res.end("");
				else fs.createReadStream(filePath).pipe(res);
			});
		}
	});
});

app.get('/problem/:problemId/check_received_gift', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.end("NO");
		else{
			action.check_received_freetraining_gift(userid,req.params.problemId,function(allow_receive){
				if(allow_receive) res.end("YES");
				else res.end("NO");
			});
		}
	});
});

app.get('/problem/:problemId/timelimit', function(req,res){
	check_login(req,function(userid){
		action.check_problem_opened(userid,req.params.problemId,function(opened){
			if(!opened) res.redirect("/problem_locked.html");
			else action.check_time_limit(req.params.problemId,function(time_limit){
				res.end(time_limit);
			});
		});
	});
});

app.get('/problem/:problemId/memlimit', function(req,res){
	check_login(req,function(userid){
		action.check_problem_opened(userid,req.params.problemId,function(opened){
			if(!opened) res.redirect("/problem_locked.html");
			else action.check_memory_limit(req.params.problemId,function(memory_limit){
				res.end(memory_limit);
			});
		});
	});
});

app.get('/problem/:problemId/problem_source', function(req,res){
	check_login(req,function(userid){
		action.check_problem_opened(userid,req.params.problemId,function(opened){
			if(!opened) res.redirect("/problem_locked.html");
			else action.check_problem_source(req.params.problemId,function(problem_source){
				res.end(problem_source);
			});
		});
	});
});

app.get('/problem/:problemId/receive_gift', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.redirect("/login_require.html");
		else{
			action.check_received_freetraining_gift(userid,req.params.problemId,function(allow_receive){
				if(!allow_receive) res.redirect("/freetraining_gift_receive_failed.html");
				else action.createFreetrainingGift(userid,req.params.problemId,function(){
					res.redirect("/gift");
				});
			});
		}
	});
});

app.post('/problem/:problemId/receive_gift', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.redirect("/login_require.html");
		else{
			action.check_received_freetraining_gift(userid,req.params.problemId,function(allow_receive){
				if(!allow_receive) res.redirect("/freetraining_gift_receive_failed.html");
				else action.createFreetrainingGift(userid,req.params.problemId,function(){
					res.redirect("/gift");
				});
			});
		}
	});
});

app.get('/problem/:problemId/getSourcesAndResults', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.end("");
		else{
			var filePath = './results/'+req.params.problemId+"_"+userid+".sources.txt";
			fs.exists(filePath, function(exists){
				if(!exists) res.end("");
				else fs.createReadStream(filePath).pipe(res);
			});
		}
	});
});

app.post('/problem/:problemId/submit', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.redirect("/login_require.html");
		else{
			action.check_problem_opened(userid,req.params.problemId,function(opened){
				if(!opened) res.redirect("/problem_locked.html");
				else if(code_language.indexOf(req.body.language)==-1) res.end("Invalid language!");
				else{
					action.update_finding_problem(userid,req.params.problemId,function(){
						action.check_allow_submit(userid,function(allow_submit){
							if(allow_submit){
								action.noncombat_grading(userid,req.params.problemId,req.body.language,req.body.source_code);
								res.redirect("/noncombat_submit_success.html");
							}
							else res.redirect("/noncombat_submit_failed.html");
						});
					});
				}
			});
		}
	});
});

app.get('/problem/:problemId',function(req,res){
	check_login(req,function(userid){
		action.check_problem_opened(userid,req.params.problemId,function(opened){
			if(!opened) res.redirect("/problem_locked.html");
			else{
				if(userid != ""){
					action.update_finding_problem(userid,req.params.problemId,function(){
						givefile(req,res,'/problem.html');
					});
				}
				else{
					anonymous_finding_problem = req.params.problemId;
					givefile(req,res,'/problem.html');
				}
			}
		});
	});
});

app.get('/problem/:problemId/check_free_solution', function(req,res){
	check_login(req,function(userid){
		action.check_problem_opened(userid,req.params.problemId,function(opened){
			if(!opened) res.end("NO");
			else{
				action.check_free_download_solution(req.params.problemId,function(allow_download){
					if(allow_download) res.end("YES");
					else res.end("NO");
				});
			}
		});
	});
});

app.get('/problem/:problemId/check_free_testdata', function(req,res){
	check_login(req,function(userid){
		action.check_problem_opened(userid,req.params.problemId,function(opened){
			if(!opened) res.end("NO");
			else{
				action.check_free_download_testdata(req.params.problemId,function(allow_download){
					if(allow_download) res.end("YES");
					else res.end("NO");
				});
			}
		});
	});
});

app.get('/problems/:problemId/:filename', function(req,res){
	check_login(req,function(userid){
		var fileExt = "." + req.params.filename.split(".")[1];
		if(fileExt == ".pdf"){
			if(req.params.filename == req.params.problemId + "_solution.pdf"){
				action.check_problem_opened(userid,req.params.problemId,function(opened){
					if(!opened) res.redirect("/problem_locked.html");
					else{
						action.check_free_download_solution(req.params.problemId,function(allow_download){
							if(allow_download) givefile(req,res,req.url);
							else{
								action.check_max_result(userid,req.params.problemId,function(max_result){
									if(max_result >= 80) givefile(req,res,req.url);
									else res.redirect("/download_solution_failed.html");
								});
							}
						});
					}
				});
			}
			else givefile(req,res,req.url);
		}
		else if(fileExt == ".zip"){
			action.check_problem_opened(userid,req.params.problemId,function(opened){
				if(!opened) res.redirect("/problem_locked.html");
				else{
					action.check_free_download_testdata(req.params.problemId,function(allow_download){
						if(allow_download) givefile(req,res,req.url);
						else{
							action.check_max_result(userid,req.params.problemId,function(max_result){
								if(max_result >= 70) givefile(req,res,req.url);
								else res.redirect("/download_test_failed.html");
							});
						}
					});
				}
			});
		}
		else res.redirect("/");
	});
});

////////////////////// --- End of algotraining

/////////////// -- Free training

app.get('/freetraining', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.redirect("/login_require.html");
		else givefile(req,res,'/freetraining.html');
	});
});

app.get('/freetraining.html', function(req,res){
	res.redirect("/");
});

app.get('/getFreetrainingProblemList', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.redirect("/login_require.html");
		else action.makeFreetrainingProblemList(req,res,userid);
	});
});

app.get('/getMissionsList', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.redirect("/login_require.html");
		else action.makeMissionsList(req,res,userid);
	});
});

app.post('/mission/gift/:index', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.redirect("/login_require.html");
		else{
			action.check_received_mission_gift(userid,req.params.index,function(allow_receive){
				if(!allow_receive) res.redirect("/mission_gift_receive_failed.html");
				else action.createMissionGift(userid,req.params.index,function(){
					res.redirect("/gift");
				});
			});
		}
	});
});

////////////////////--- End of freetraining

//////////////// -- Combat !!!

app.get('/check_card_using', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.redirect("/login_require.html");
		else action.check_card_using(userid,function(cardid){
			res.end(cardid.toString());
		});
	});
});

app.get('/update_card_using/:cardid', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.redirect("/login_require.html");
		else{
			action.check_card_possession(userid,req.params.cardid,function(num){
				if(num > 0){
					action.update_card_using(userid,req.params.cardid);
					res.end("update card success!");
				}
				else res.end("update card failed!");
			});
		}
	});
});

app.get('/check_choose_problem_level', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.redirect("/login_require.html");
		else action.check_choose_problem_level(userid,function(level){
			res.end(level.toString());
		});
	});
});

app.get('/update_choose_problem_level/:level', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.redirect("/login_require.html");
		else{
			var level = parseInt(req.params.level);
			if(level<1 || level>3 || level.toString()=='NaN') res.end("update level failed!");
			else{
				action.update_choose_problem_level(userid,level);
				res.end("update level success");
			}
		}
	});
});

app.get('/combat_preparation', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.redirect("/login_require.html");
		else givefile(req,res,'/combat_preparation.html');
	});
});

app.get('/combat_preparation.html', function(req,res){
	res.redirect("/");
});

app.get('/combat/request', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.redirect("/login_require.html");
		else{
			action.check_next_combat(userid,function(combatid){
				if(combatid != null) res.end(combatid);
				else{
					action.check_having_combat(userid,function(combatid){
						if(combatid != null) res.end("still having combat");
						else action.check_card_using(userid,function(cardid){
							if(cardid == -1) res.end("did not choose card");
							else action.create_combat_request(userid,function(){
								res.end("");
							});
						});
					});
				}
			});
		}
	});
});

app.get('/combat/stop_request', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.redirect("/login_require.html");
		else action.stop_combat_request(userid,function(){
			res.end("");
		});
	});
});

app.get('/combat/check_block_all_challenge', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.end("");
		else action.check_block_challenge(userid,function(block_challenge){
			if(block_challenge) res.end("YES");
			else res.end("NO");
		});
	});
});

app.get('/combat/block_all_challenge', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.redirect("/login_require.html");
		else action.block_all_challenge(userid,function(){
			res.end("");
		});
	});
});

app.get('/combat/unblock_all_challenge', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.redirect("/login_require.html");
		else action.unblock_all_challenge(userid,function(){
			res.end("");
		});
	});
});

app.get('/combat/block_challenge/:blockid', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.redirect("/login_require.html");
		else action.block_challenge(userid,req.params.blockid,function(){
			res.end("");
		});
	});
});

app.get('/combat/unblock_challenge/:blockid', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.redirect("/login_require.html");
		else action.unblock_challenge(userid,req.params.blockid,function(){
			res.end("");
		});
	});
});

app.get('/combat/get_challenge', function(req,res){
	if(!challenge_status) res.end("");
	else{
		check_login(req,function(userid){
			if(userid=="") res.end("");
			else action.check_having_combat(userid,function(combatid){
				if(combatid != null) res.end("");
				else{
					action.get_challenge(userid,function(oppid,level){
						if(level!=-1) res.end(oppid+" "+level);
						else res.end("");
					});
				}
			});
		});
	}
});

app.get('/combat/get_combat', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.end("");
		else action.check_next_combat(userid,function(combatid){
			if(combatid != null) res.end(combatid);
			else res.end("");
		});
	});
});

app.get('/combat/accept_challenge/:oppid', function(req,res){
	if(!challenge_status) res.end("Accept failed!");
	else{
		check_login(req,function(userid){
			if(userid=="") res.end("Accept failed!");
			else action.check_having_combat(userid,function(combatid){
				if(combatid != null) res.end("Accept failed!");
				else{
					action.accept_challenge(userid,req.params.oppid,function(respond){
						res.end(respond);
					});
				}
			});
		});
	}
});

app.get('/combat/getUsersStatus', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.end("");
		else action.makeUsersStatus(req,res,userid);
	});
});

app.get('/combat/getUserCombats', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.end("");
		else action.makeUserCombats(req,res,userid,true);
	});
});

app.get('/combat/getUserCombats/:userid', function(req,res){
	action.check_user_exists(req.params.userid,function(user_exists){
		if(!user_exists) res.end("");
		else action.makeUserCombats(req,res,req.params.userid,false);
	});
});

app.get('/combat/challenge/:oppid', function(req,res){
	if(!challenge_status) res.end("Challenge feature is temporarily blocked, please try again later!");
	else{
		check_login(req,function(userid){
			if(userid=="") res.end("Please log in to send challenge!");
			else action.check_having_combat(userid,function(combatid){
				if(combatid != null) res.end("still having combat");
				else{
					action.make_challenge(userid,req.params.oppid,function(message){
						res.end(message);
					});
				}
			});
		});
	}
});

app.get('/combat/gift/:combatid', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.redirect("/login_require.html");
		else{
			action.check_received_combat_gift(userid,req.params.combatid,function(allow_receive){
				if(!allow_receive) res.redirect("/combat_gift_receive_failed.html");
				else action.createCombatGift(userid,req.params.combatid,function(){
					res.redirect("/gift");
				});
			});
		}
	});
});

app.get('/combat/add_to_freetraining/:combatid', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.redirect("/login_require.html");
		else action.check_add_to_freetraining(userid,req.params.combatid,function(allow_add){
			if(!allow_add) res.redirect("/add_to_freetraining_failed.html");
			else action.add_to_freetraining(req,res,userid,req.params.combatid);
		}); 
	});
});

app.get('/combat/finding_combat', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.end(anonymous_finding_combat);
		else action.check_finding_combat(userid,function(combatid){
			if(combatid != null) res.end(combatid.toString());
			else res.end("");
		});
	});
});

app.get('/combat/message/:combatid', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.end("");
		else action.get_combat_message(userid,req.params.combatid,function(message){
			res.end(message);
		})
	});
});

app.get('/combat/get_problemset/:combatid', function(req,res){
	check_login(req,function(userid){
		action.get_combat_problem(req.params.combatid,function(problemid){
			if(problemid == "") res.end("");
			else action.check_allow_read_combat_problem(userid,req.params.combatid,function(allow_read){
				if(allow_read) givefile(req,res,"/problems/"+problemid+"/"+problemid+".pdf");
				else givefile(req,res,"/problems/problem_locked.pdf");
			});
		});
	});
});

app.get('/combat/timelimit/:combatid', function(req,res){
	check_login(req,function(userid){
		action.get_combat_problem(req.params.combatid,function(problemid){
			if(problemid == "") res.end("N/A");
			else action.check_allow_read_combat_problem(userid,req.params.combatid,function(allow_read){
				if(allow_read) action.check_time_limit(problemid,function(time_limit){
					res.end(time_limit);
				});
				else res.end("N/A");
			});
		});
	});
});

app.get('/combat/memlimit/:combatid', function(req,res){
	check_login(req,function(userid){
		action.get_combat_problem(req.params.combatid,function(problemid){
			if(problemid == "") res.end("N/A");
			else action.check_allow_read_combat_problem(userid,req.params.combatid,function(allow_read){
				if(allow_read) action.check_memory_limit(problemid,function(memory_limit){
					res.end(memory_limit);
				});
				else res.end("N/A");
			});
		});
	});
});

app.get('/combat/minute/:combatid', function(req,res){
	check_login(req,function(userid){
		action.get_combat_minute(req.params.combatid,function(minute){
			res.end(minute.toString());
		});
	});
});

app.get('/combat/second/:combatid', function(req,res){
	check_login(req,function(userid){
		action.get_combat_second(req.params.combatid,function(second){
			res.end(second.toString());
		});
	});
});

app.get('/combat/problemid/:combatid', function(req,res){
	check_login(req,function(userid){
		action.get_combat_problem(req.params.combatid,function(problemid){
			res.end(problemid);
		});
	});
});

app.get('/combat/myid/:combatid', function(req,res){
	check_login(req,function(userid){
		action.get_combat_myid(userid,req.params.combatid,function(myid){
			res.end(myid);
		});
	});
});

app.get('/combat/oppid/:combatid', function(req,res){
	check_login(req,function(userid){
		action.get_combat_oppid(userid,req.params.combatid,function(oppid){
			res.end(oppid);
		});
	});
});

app.get('/combat/mycard/:combatid', function(req,res){
	check_login(req,function(userid){
		action.get_combat_mycard(userid,req.params.combatid,function(mycard){
			if(mycard == -1) givefile(req,res,'/cards/unknown.jpg');
			else givefile(req,res,'/cards/effect/'+mycard+".jpg");
		});
	});
});

app.get('/combat/oppcard/:combatid', function(req,res){
	check_login(req,function(userid){
		action.get_combat_oppcard(userid,req.params.combatid,function(oppcard){
			if(oppcard == -1) givefile(req,res,'/cards/unknown.jpg');
			else givefile(req,res,'/cards/effect/'+oppcard+".jpg");
		});
	});
});

app.get('/combat/level/:combatid', function(req,res){
	check_login(req,function(userid){
		action.get_combat_level(req.params.combatid,function(level){
			res.end(level.toString());
		});
	});
});

app.get('/combat/myscore/:combatid', function(req,res){
	check_login(req,function(userid){
		action.get_combat_score(userid,req.params.combatid,function(myscore){
			res.end(myscore.toString());
		});
	});
});

app.get('/combat/oppscore/:combatid', function(req,res){
	check_login(req,function(userid){
		action.get_combat_oppscore(userid,req.params.combatid,function(oppscore){
			res.end(oppscore.toString());
		});
	});
});

app.get('/combat/my_original_score/:combatid', function(req,res){
	check_login(req,function(userid){
		action.get_combat_original_score(userid,req.params.combatid,function(original_score){
			res.end(original_score.toString());
		});
	});
});

app.get('/combat/opp_original_score/:combatid', function(req,res){
	check_login(req,function(userid){
		action.get_combat_opponent_original_score(userid,req.params.combatid,function(original_score){
			res.end(original_score.toString());
		});
	});
});

app.get('/combat/grading_code/:combatid', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.end("0");
		else action.get_combat_grading_code(userid,req.params.combatid,function(grading_code){
			res.end(grading_code.toString());
		})
	});
});

app.get('/combat/grading_num/:combatid', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.end("0");
		else action.get_combat_grading_num(userid,req.params.combatid,function(grading_num){
			res.end(grading_num.toString());
		})
	});
});

app.get('/combat/grading_log/:combatid', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.end("");
		else action.get_combat_problem(req.params.combatid,function(problemid){
			if(problemid == "") res.end("");
			else{
				action.get_combat_myid(userid,req.params.combatid,function(myid){
					if(myid != userid) res.end("");
					else{
						var filePath = './results/'+problemid+"_"+userid+".log";
						fs.exists(filePath, function(exists){
							if(!exists) res.end("");
							else fs.createReadStream(filePath).pipe(res);
						});
					}
				});
			}
		});
	});
});

app.get('/combat/submission_left/:combatid', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.end("0");
		else action.get_combat_submit_left(userid,req.params.combatid,function(submit_left){
			res.end(submit_left.toString());
		})
	});
});

app.get('/combat/check_download_solution/:combatid', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.end("NO");
		else action.check_combat_download_solution(userid,req.params.combatid,function(allow_download){
			if(allow_download) res.end("YES");
			else res.end("NO");
		})
	});
});

app.get('/combat/download_solution/:combatid', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.end("Download failed!");
		else action.check_combat_download_solution(userid,req.params.combatid,function(allow_download){
			if(allow_download){
				action.get_combat_problem(req.params.combatid,function(problemid){
					givefile(req,res,"/problems/"+problemid+"/"+problemid+"_solution.pdf");
				});
			}
			else res.end("Download failed!");
		})
	});
});

app.get('/combat/check_change_problem/:combatid', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.end("NO");
		else action.check_combat_change_problem(userid,req.params.combatid,function(allow_change){
			if(allow_change) res.end("YES");
			else res.end("NO");
		})
	});
});

app.get('/combat/change_problem/:combatid', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.redirect("/change_combat_problem_failed.html");
		else action.check_combat_change_problem(userid,req.params.combatid,function(allow_change){
			if(allow_change){
				action.update_finding_combat(userid,req.params.combatid,function(){
					action.change_combat_problem(userid,req.params.combatid,function(){
						res.redirect("/change_combat_problem_success.html");
					});
				});
			}
			else res.redirect("/change_combat_problem_failed.html");
		})
	});
});

app.get('/combat/getSourcesAndResults/:combatid', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.end("");
		else action.get_combat_problem(req.params.combatid,function(problemid){
			if(problemid == "") res.end("");
			else{
				action.get_combat_myid(userid,req.params.combatid,function(myid){
					if(myid != userid) res.end("");
					else{
						var filePath = './results/'+problemid+"_"+userid+".sources.txt";
						fs.exists(filePath, function(exists){
							if(!exists) res.end("");
							else fs.createReadStream(filePath).pipe(res);
						});
					}
				});
			}
		});
	});
});

app.post('/combat/submit/:combatid', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.redirect("/login_require.html");
		else{
			action.check_combat_allow_submit(userid,req.params.combatid,function(allow_combat_submit){
				if(!allow_combat_submit) res.redirect("/combat_submit_failed.html");
				else if(code_language.indexOf(req.body.language)==-1) res.end("Invalid language!");
				else{
					action.update_finding_combat(userid,req.params.combatid,function(){
						action.check_allow_submit(userid,function(allow_submit){
							if(allow_submit){
								action.combat_grading(userid,req.params.combatid,req.body.language,req.body.source_code);
								res.redirect("/combat_submit_success.html");
							}
							else res.redirect("/combat_submit_failed.html");
						});
					});
				}
			});
		}
	});
});

app.get('/combat/:combatid', function(req,res){
	check_login(req,function(userid){
		action.check_combat_exists(req.params.combatid,function(combat_exists){
			if(!combat_exists) res.redirect("/");
			else{
				if(userid != ""){
					action.update_finding_combat(userid,req.params.combatid,function(){
						givefile(req,res,'/combat.html');
					});
				}
				else{
					anonymous_finding_combat = req.params.combatid;
					givefile(req,res,'/combat.html');
				}
			}
		});
	});
});

app.get('/combat.html', function(req,res){
	res.redirect("/");
});

/////////////////// --- End of combat

app.get('/cards/possession/:userid/:cardId', function(req,res){
	action.check_user_exists(req.params.userid,function(user_exists){
		if(!user_exists) givefile(req,res,'/cards/unknown.jpg');
		else{
			action.check_card_possession(req.params.userid,req.params.cardId,function(num){
				if(num > 0) givefile(req,res,'/cards/plain/'+req.params.cardId+"_plain.jpg");
				else givefile(req,res,'/cards/unknown.jpg');
			});
		}
	});
});

app.get('/cards/effect/:cardId/copy', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.redirect("/");
		else{
			action.check_card_possession(userid,req.params.cardId,function(num){
				res.end(num.toString());
			});
		}
	});
});

app.get('/cards/effect/:cardId', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.redirect("/");
		else{
			action.check_card_possession(userid,req.params.cardId,function(num){
				if(num==0) givefile(req,res,'/cards/unknown.jpg');
				else givefile(req,res,req.url+'.jpg');
			});
		}
	});
});

app.get('/cards/get_description/:cardid', function(req,res){
	if(parseInt(req.params.cardid).toString() != "NaN" && parseInt(req.params.cardid) > 0 &&
	 	parseInt(req.params.cardid) < cards_description.length) 
	 		res.end(cards_description[parseInt(req.params.cardid)]);
	else res.end("");
});

app.get('/admin/cards/:cardid', function(req,res){
	check_login(req,function(userid){
		if(userid!="admin") givefile(req,res,'/cards/unknown.jpg');
		else givefile(req,res,'/cards/effect/'+req.params.cardid+'.jpg');
	});
});

app.get('/getCurrentGift', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.redirect("/");
		else action.check_current_gift(userid,true,function(giftid){
			res.end(giftid);
		});
	});
});

app.get('/gift', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.redirect("/");
		else action.check_current_gift(userid,false,function(giftid){
			if(giftid == "") res.redirect("/");
			else givefile(req,res,'/gift.html');
		});
	});
});

app.get('/gift.html', function(req,res){
	res.redirect("/");
});

app.get('/code/:filename', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.end("You must log in to see this code!");
		else{
			var filePath = '.'+req.url;
			fs.exists(filePath, function(exists){
				if(!exists) res.end("File does not exist!");
				else{
					var code_owner = req.params.filename.split("_")[1];
					if(code_owner == userid) fs.createReadStream(filePath).pipe(res);
					else res.redirect("/download_code_failed.html");
				}
			});
		}
	});
});

/////// -- Admin page

app.get('/getCardDropdown', function(req,res){
	check_login(req,function(userid){
		if(userid!="admin") res.redirect("/");
		else action.makeCardDropdown(req,res);
	});
});

app.get('/getAlgoDropdown', function(req,res){
	check_login(req,function(userid){
		if(userid!="admin") res.redirect("/");
		else action.makeAlgoDropdown(req,res);
	});
});

app.get('/getAllCardsInfo', function(req,res){
	check_login(req,function(userid){
		if(userid!="admin") res.redirect("/");
		else action.makeAllCardsInfo(req,res);
	});
});

app.get('/getAllAlgorithmsInfo', function(req,res){
	check_login(req,function(userid){
		if(userid!="admin") res.redirect("/");
		else action.makeAllAlgorithmsInfo(req,res);
	});
});

app.get('/getAllAlgoCondInfo', function(req,res){
	check_login(req,function(userid){
		if(userid!="admin") res.redirect("/");
		else action.makeAllAlgoCondInfo(req,res);
	});
});

app.get('/algorithms/:algoIntroFile', function(req,res,next){
	check_login(req,function(userid){
		if(userid=="") res.redirect("/");
		else{
			var filePath = path.resolve('.'+req.url);
			var fileExt = path.extname(filePath);
			if(fileExt!='.pdf') next();
			else if(req.params.algoIntroFile.substr(0,req.params.algoIntroFile.length-4).indexOf("'")>-1) next();
			else if(req.params.algoIntroFile.substr(0,req.params.algoIntroFile.length-4).indexOf('"')>-1) next();
			else{
				action.check_algorithm_opened(userid,req.params.algoIntroFile.substr(0,req.params.algoIntroFile.length-4),function(opened){
					if(!opened) res.redirect("/");
					else givefile(req,res,req.url);
				});
			}
		}
	});
});

//--- Forbidden folders
app.get('/js/card_effect/*', function(req,res){
	res.redirect("/");
});

app.get('/js/missions/*', function(req,res){
	res.redirect("/");
});

app.get('/algorithms/*', function(req,res){
	res.redirect("/");
});

app.get('/problems/*', function(req,res){
	res.redirect("/");
});

app.get('/logs/*', function(req,res){
	res.redirect("/");
});

app.get('/results/*', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.redirect("/");
		else{
			var filePath = '.'+req.url;
			fs.exists(filePath, function(exists){
				if(!exists) res.end("File does not exist!");
				else{
					var filetype = req.url.split(".")[1];
					var owner = req.url.split("_")[1];
					if(filetype == "judge" && owner == userid) 
						fs.createReadStream(filePath).pipe(res);
					else res.redirect("/");
				}
			});
		}
	});
});

app.get('/other/*', function(req,res){
	res.redirect("/");
});

//------------- POST requests:

app.post('/change_username', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.redirect("/login_require.html");
		else action.change_username(userid,req.body.username,function(){
			res.redirect("/change_profile_success.html");
		});
	});
});

app.post('/change_password', function(req,res){
	check_login(req,function(userid){
		if(userid=="") res.redirect("/login_require.html");
		else action.change_password(userid,req.body.current_password,req.body.password,req.body.re_password,function(changed_password){
			if(changed_password) res.redirect("/change_password_success.html");
			else res.redirect("/change_password_failed.html");
		});
	});
});

app.post('/login', function(req, res){
	console.log('IP ' + req.connection.remoteAddress + ' request for ' + req.url + ' by method ' + req.method);
	console.log('Username: ' + req.body.userid);
	console.log('Password: ' + req.body.password); 

	check_login(req,function(userid){
		if(userid!="") res.redirect("/");
		else action.login(req,res);
	});
});

app.post('/signup', function(req, res){
	console.log('IP ' + req.connection.remoteAddress + ' request for ' + req.url + ' by method ' + req.method);
	console.log('Username: ' + req.body.username);
	console.log('User ID: ' + req.body.userid);
	console.log('Password: ' + req.body.password);
	console.log('Retyped password: ' + req.body.re_password);

	check_login(req,function(userid){
		if(userid!="") res.redirect("/");
		else action.signup(req,res);
	});
});

app.get('/logout', function(req,res){
	check_login(req,function(userid){
		if(userid!="") action.logout(req,userid);
	});
	res.redirect("/");
});

//--- Admin page:

app.post('/delete_logs', function(req,res){
	check_login(req,function(userid){
		if(userid!="admin") res.redirect("/");
		else action.delete_logs(function(){
			res.redirect("/admin");
		});
	});
});

app.get('/check_judging_submissions', function(req,res){
	check_login(req,function(userid){
		if(userid!="admin") res.end("");
		else action.check_judging_submissions(function(judging_submissions){
			res.end(judging_submissions);
		});
	});
});

app.post('/combat_generator_open', function(req,res){
	check_login(req,function(userid){
		if(userid!="admin") res.redirect("/");
		else action.combat_generator_open(function(){
			res.redirect("/admin");
		});
	});
});

app.post('/combat_generator_close', function(req,res){
	check_login(req,function(userid){
		if(userid!="admin") res.redirect("/");
		else action.combat_generator_close(function(){
			res.redirect("/admin");
		});
	});
});

app.post('/challenge_status_open', function(req,res){
	check_login(req,function(userid){
		if(userid!="admin") res.redirect("/");
		else{
			challenge_status = true;
			res.redirect("/admin");
		};
	});
});

app.post('/challenge_status_close', function(req,res){
	check_login(req,function(userid){
		if(userid!="admin") res.redirect("/");
		else{
			challenge_status = false;
			res.redirect("/admin");
		};
	});
});

app.post('/add_custom_combat', function(req,res){
	check_login(req,function(userid){
		if(userid!="admin") res.redirect("/");
		else action.add_custom_combat(req.body.player1,req.body.player2,req.body.level,function(respond){
			if(respond == "") res.redirect("/admin");
			else res.end(respond);
		});
	});
});

app.post('/add_livestream_combat', function(req,res){
	check_login(req,function(userid){
		if(userid!="admin") res.redirect("/");
		else action.add_custom_combat("player1","player2",req.body.level,function(respond){
			if(respond == "") res.redirect("/");
			else res.end(respond);
		});
	});
});

app.get('/random_three_cards/1', function(req,res){
	check_login(req,function(userid){
		if(userid!="admin") res.end("");
		else action.random_three_cards("player1",function(content){
			res.end(content);
		});
	});
});

app.get('/random_three_cards/2', function(req,res){
	check_login(req,function(userid){
		if(userid!="admin") res.end("");
		else action.random_three_cards("player2",function(content){
			res.end(content);
		});
	});
});

app.post('/delete_all_cookies', function(req,res){
	check_login(req,function(userid){
		if(userid!="admin") res.redirect("/");
		else action.delete_all_cookies(req,res);
	});
});

app.post('/delete_an_user', function(req,res){
	check_login(req,function(userid){
		if(userid!="admin" || req.body.userid=="admin") res.redirect("/");
		else action.delete_an_user(req,res,req.body.userid);
	});
});

app.post('/add_card', function(req,res){
	check_login(req,function(userid){
		if(userid!="admin") res.redirect("/");
		else action.add_card(req,res,req.body.cardname,req.body.level);
	});
});

app.post('/delete_card', function(req,res){
	check_login(req,function(userid){
		if(userid!="admin") res.redirect("/");
		else action.delete_card(req,res,req.body.cardid);
	});
});

app.post('/add_problem', function(req,res){
	check_login(req,function(userid){
		if(userid!="admin") res.redirect("/");
		else action.add_problem(req,res,req.body.problemid,req.body.type,req.body.level,req.body.algorithm,req.body.source);
	});
});

app.post('/delete_problem', function(req,res){
	check_login(req,function(userid){
		if(userid!="admin") res.redirect("/");
		else action.delete_problem(req,res,req.body.problemid);
	});
});

app.post('/add_algorithm', function(req,res){
	check_login(req,function(userid){
		if(userid!="admin") res.redirect("/");
		else action.add_algorithm(req,res,req.body.algoname,req.body.gift_limit,req.body.level);
	});
});

app.post('/delete_algorithm', function(req,res){
	check_login(req,function(userid){
		if(userid!="admin") res.redirect("/");
		else action.delete_algorithm(req,res,req.body.algorithm);
	});
});

app.post('/add_algocond', function(req,res){
	check_login(req,function(userid){
		if(userid!="admin") res.redirect("/");
		else action.add_algocond(req,res,req.body.algoid,req.body.cond_algo);
	});
});

app.post('/delete_algocond', function(req,res){
	check_login(req,function(userid){
		if(userid!="admin") res.redirect("/");
		else action.delete_algocond(req,res,req.body.algoid,req.body.cond_algo);
	});
});

//------ End of admin page

//--- Other files: css, js, txt...
app.get('/*', function(req,res){
	givefile(req,res,req.url);
});

//-------------------------------

app.listen(port, hostname, function(){
	console.log('Server running at http://' + hostname + ':' + port + '/');
}); // start the server and print the status to the console