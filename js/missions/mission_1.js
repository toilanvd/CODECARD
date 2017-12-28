function get_bit(x,i){
	return (x >>> i)%2;
}

exports.information = function(callback){
	//callback(title,body,gift_cardid,index);
	callback("ALGORITHMS MASTER","Solved 100 problems",22,1);
}

exports.check_allow_receive_gift = function(db,userid,callback){
	db.query("SELECT * FROM user_problems WHERE userid = '"+userid+
			"' AND type <> 'hidden' AND type <>'combat' AND max_result = 100", function(err,solved,fields){
		if(err) throw err;
		if(solved.length < 100) callback(false);
		else{
			db.query("SELECT * FROM combat_wins WHERE userid = '"+userid+"'", function(err,user,fields){
				if(err) throw err;
				if(get_bit(user[0].receive_gift_mask,1)==1) callback(false);
				else callback(true);
			});
		}
	});
}

exports.check_process = function(db,userid,callback){
	//callback(completed,need)
	db.query("SELECT * FROM user_problems WHERE userid = '"+userid+
			"' AND type <> 'hidden' AND type <>'combat' AND max_result = 100", function(err,solved,fields){
		if(err) throw err;
		callback(solved.length,100);
	});
}

exports.make_gift = function(db,userid,callback){
	var rg_add_amount = (1 << 1);
	db.query("UPDATE combat_wins SET receive_gift_mask = receive_gift_mask+"+rg_add_amount+
			" WHERE userid = '"+userid+"'", function(err,upd,fields){
		if(err) throw err;
		callback(22);
	});
}