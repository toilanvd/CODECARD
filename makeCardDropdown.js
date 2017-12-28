exports.process = function(db,callback){
	db.query("SELECT * FROM cards",function(err,card,fields){
		if(err) throw err;

		var content = "<option value='-1'>-1 - No delete</option>\n";
		if(card.length>0){
			var cnt = 0;
			for(var i=0;i<card.length;i++){
				content += "<option value='"+card[i].cardid+"'>"+card[i].cardid+" - "+card[i].name+"</option>\n";

				cnt++;
				if(cnt == card.length) callback(content);
			}
		}
		else callback(content);
	});
}