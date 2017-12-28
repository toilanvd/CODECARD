var fs = require('fs');

exports.process = function(db,callback){
	db.query("SELECT * FROM algorithms",function(err,algo,fields){
		if(err) throw err;

		var content = "<option value='0'>0 - Not algorithm training</option>\n";
		if(algo.length>0){
			var cnt = 0;
			for(var i=0;i<algo.length;i++){
				content += "<option value='"+algo[i].algoid+"'>"+algo[i].algoid+" - "+algo[i].name+"</option>\n";

				cnt++;
				if(cnt == algo.length) callback(content);
			}
		}
		else callback(content);
	});
}