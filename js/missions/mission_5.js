function get_bit(x,i){
	return (x >>> i)%2;
}

exports.information = function(callback){
	//callback(title,body,gift_cardid,index);
	callback("SPEED MASTER","Flawless win 10 combats with less than 30 minutes each",26,5);
}

exports.check_allow_receive_gift = function(db,userid,callback){
	db.query("SELECT * FROM combat_wins WHERE userid = '"+userid+"'", function(err,user,fields){
		if(err) throw err;
		if(get_bit(user[0].receive_gift_mask,5)==1) callback(false);
		else if(user[0].half_hour < 10) callback(false);
		else callback(true);
	});
}

exports.check_process = function(db,userid,callback){
	//callback(completed,need)
	db.query("SELECT * FROM combat_wins WHERE userid = '"+userid+"'", function(err,user,fields){
		if(err) throw err;
		callback(user[0].half_hour,10);
	});
}

exports.make_gift = function(db,userid,callback){
	var rg_add_amount = (1 << 5);
	db.query("UPDATE combat_wins SET receive_gift_mask = receive_gift_mask+"+rg_add_amount+
			" WHERE userid = '"+userid+"'", function(err,upd,fields){
		if(err) throw err;
		callback(26);
	});
}