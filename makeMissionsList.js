var hostname = "codecard.cf";
var port = 80;

var number_of_missions = 6;

exports.process = function(db,userid,callback){
	var mission = [];
	for(var i=0;i<number_of_missions;i++) mission.push(require('./js/missions/mission_'+i+'.js'));

	var mission_row = [];
	for(var i=0;i<number_of_missions;i++) mission_row.push('');
	
	var content = "<table>\n<tr><th>Mission</th><th>Process</th><th>Gift</th><th>Receive</th></tr>\n";
	
	if(number_of_missions == 0){
		content += "</table>";
		callback(content);
	}
	else{
		var cnt = 0;
		for(var i=0;i<number_of_missions;i++){
			mission[i].information(function(title,body,gift_cardid,index){
				mission[index].check_process(db,userid,function(completed,need){
					mission[index].check_allow_receive_gift(db,userid,function(allow_receive){

						var row = '<tr>';

						row += "<td>"+
								"<p><b>"+title+"</p></b>"+
								"<p>"+body+"</p>"+
								"</td>";

						row += "<td>"+completed+"/"+need+"</td>";

						if(index<Math.floor(number_of_missions/2)) 
							row += "<td><div class='gift'><img class='gift-image' src='http://"+hostname+":"+port+"/cards/plain/"+gift_cardid+"_plain.jpg'>\n"+
								"<img class='gift-image-popup-first-half' src='http://"+hostname+":"+port+"/cards/plain/"+gift_cardid+"_plain.jpg'>\n"+"</div></td>";
						else row += "<td><div class='gift'><img class='gift-image' src='http://"+hostname+":"+port+"/cards/plain/"+gift_cardid+"_plain.jpg'>\n"+
								"<img class='gift-image-popup-second-half' src='http://"+hostname+":"+port+"/cards/plain/"+gift_cardid+"_plain.jpg'>\n"+"</div></td>";

						if(allow_receive) row += "<td><form method='POST' action='http://"+hostname+":"+port+
												"/mission/gift/"+index+"'><input value='get' type='submit'></form></td>";
						else if(completed >= need) row += "<td>OK</td>";
						else row += "<td></td>";

						row += "</tr>\n";
						mission_row[index] = row;

						cnt++;
						if(cnt == number_of_missions){
							for(var j=0;j<number_of_missions;j++) content += mission_row[j];
							content += "</table>";
							callback(content);
						}
					})
				});
			});
		}
	}
}