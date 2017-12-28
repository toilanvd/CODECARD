function get_bit(x,i){
	return (x >>> i)%2;
}

exports.information = function(callback){
	//callback(title,body,gift_cardid,index);
	callback("HARD MODE MASTER","Flawless win 10 combats of level 3",24,3);
}

exports.check_allow_receive_gift = function(db,userid,callback){
	db.query("SELECT * FROM combat_wins WHERE userid = '"+userid+"'", function(err,user,fields){
		if(err) throw err;
		if(get_bit(user[0].receive_gift_mask,3)==1) callback(false);
		else if(user[0].level_three < 10) callback(false);
		else callback(true);
	});
}

exports.check_process = function(db,userid,callback){
	//callback(completed,need)
	db.query("SELECT * FROM combat_wins WHERE userid = '"+userid+"'", function(err,user,fields){
		if(err) throw err;
		callback(user[0].level_three,10);
	});
}

exports.make_gift = function(db,userid,callback){
	var rg_add_amount = (1 << 3);
	db.query("UPDATE combat_wins SET receive_gift_mask = receive_gift_mask+"+rg_add_amount+
			" WHERE userid = '"+userid+"'", function(err,upd,fields){
		if(err) throw err;
		callback(24);
	});
}