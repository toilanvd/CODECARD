var hostname = "codecard.cf";
var port = 80;

var action = require('./action.js');

var make = {
	solved_list: function(content,db,userid,algoid,solved_problems_count,callback){
		content += "<p><b>* Solved problems: " + solved_problems_count + "</b></p>\n";
		var cnt = 0;

		db.query("SELECT * FROM user_problems WHERE userid = '"+userid+
				"' AND algorithm = "+algoid+" AND max_result = 100", function(err,problems,fields){
			for(var i=0;i<problems.length;i++){
				cnt++;
				content += "<p>" + cnt + ", " + "<a href='http://" + hostname + ':' + port + 
							"/problem/" + problems[i].problemid + "'>" + problems[i].problemid + "</a></p>\n";
			}
			callback(content);
		});
	},

	unsolved_list: function(content,db,userid,algoid,unsolved_problems_count,callback){
		content += "<p><b>* Not solved problems: " + unsolved_problems_count + "</b></p>\n";
		var cnt = 0;

		db.query("SELECT * FROM user_problems WHERE userid = '"+userid+
				"' AND algorithm = "+algoid+" AND max_result <> 100", function(err,problems,fields){
			for(var i=0;i<problems.length;i++){
				cnt++;
				content += "<p>" + cnt + ", " + "<a href='http://" + hostname + ':' + port + 
							"/problem/" + problems[i].problemid + "'>" + problems[i].problemid + "</a></p>\n";
			}
			callback(content);
		});
	}
}



exports.process = function(db,userid,algoid,callback){
	db.query("SELECT * FROM user_algorithms WHERE userid = '"+userid+"' AND algoid = "+algoid,function(err,algorithm,fields){
		var content_withAlgoInfo = "<div id='algo-title' class='algo-title'>\n<p><b><u><font size='5'>"+algorithm[0].name+"</font></u></b></p>\n</div>\n"+
									"<div id='algo-problems' class='algo-problems'>\n<p>(You must solve at least "+algorithm[0].gift_limit+" problems to complete this algorithm and receive gift)</p>\n";
		content_withAlgoInfo += "<div class='receive-gift-button'>\n";

		action.check_received_algorithm_gift(userid,algoid,function(allow_receive){
			if(!allow_receive){
				content_withAlgoInfo += "<img src='../media/receive_gift.png' class='receive-gift-unavailable-button-image'>\n" + "</div>\n";
			}
			else{
				content_withAlgoInfo += "<a href='http://" + hostname + ':' + port + "/algotraining/gift/" + algoid + "'>" +
										"<img src='../media/receive_gift.gif' class='receive-gift-available-button-image'>" + "</a>\n" + "</div>\n";
			}

			make.solved_list(content_withAlgoInfo,db,userid,algoid,algorithm[0].accepted_problems,function(content_withSolvedList){
				make.unsolved_list(content_withSolvedList,db,userid,algoid,algorithm[0].unaccepted_problems,function(content_full){
					callback(content_full+"</div>\n");
				});
			});
		});
	});
}