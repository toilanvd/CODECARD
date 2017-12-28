var hostname = "codecard.cf";
var port = 80;

var fs = require('fs');

exports.process = function(userid,problemId,grading_num,language,source_code,callback){
	require('./judge_'+language+'.js').process(userid,problemId,grading_num,source_code,function(result,running_time){
		fs.appendFile("results/"+problemId+"_"+userid+".sources.txt",
			"<p><a href='http://"+hostname+':'+port
			+"/code/"+problemId+'_'+userid+'_'+grading_num+'.'+language
			+"' download='"+problemId+"_"+grading_num+'.'+language
			+"'>#"+grading_num+"</a>: <a href='http://"+hostname+':'+port
			+"/results/"+problemId+'_'+userid+'_'+grading_num+".judge.txt' download='"
			+problemId+"_"+grading_num+".log'>"+result+"</p>\n",function(){
				callback(result,running_time);
		});
	});
}