exports.affect_player_pregame = function(opp_cardid,callback){
	var copycard = require('./card_'+opp_cardid+'.js');
	if(opp_cardid==20) callback(0,60,0,60,0,0,0,false,0,0,61,0);
	else copycard.affect_player_pregame(opp_cardid,function(submit_left,max_time,lock_problemset_time,dead_time,dead_score,card_score,virtual_score,ingame_acitve,bonuspoint_time,bonus_coefficient,solution_time,change_problem_time){
		callback(submit_left,max_time,lock_problemset_time,dead_time,dead_score,card_score,virtual_score,ingame_acitve,bonuspoint_time,bonus_coefficient,solution_time,change_problem_time);
	});
}

exports.affect_opponent_pregame = function(opp_cardid,callback){
	var copycard = require('./card_'+opp_cardid+'.js');
	if(opp_cardid==20) callback(0,60,0,60,0,0,0,false,0,0,61,0);
	else copycard.affect_opponent_pregame(opp_cardid,function(submit_left,max_time,lock_problemset_time,dead_time,dead_score,card_score,virtual_score,ingame_acitve,bonuspoint_time,bonus_coefficient,solution_time,change_problem_time){
		callback(submit_left,max_time,lock_problemset_time,dead_time,dead_score,card_score,virtual_score,ingame_acitve,bonuspoint_time,bonus_coefficient,solution_time,change_problem_time);
	});
}

exports.affect_post_game = function(opp_cardid,opp_card_level,problem_level,callback){
	//callback(gift_cardid,gift_level);
	var copycard = require('./card_'+opp_cardid+'.js');
	if(opp_cardid==20) callback(-1,problem_level+2);
	else copycard.affect_post_game(opp_cardid,opp_card_level,problem_level,function(gift_cardid,gift_level){
		callback(gift_cardid,gift_level);
	});
}