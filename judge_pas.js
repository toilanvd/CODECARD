var fs = require('fs');
var exec = require('child_process').exec;

exports.process = function(userid,problemId,grading_num,source_code,callback){
	var filename = problemId+"_"+userid+"_"+grading_num;
	fs.writeFile("code/"+filename+".pas",source_code,function(){
		exec("./judge_pas "+problemId+" "+filename,function(){
			exec("cp ./logs/"+filename+".judge.txt ./results/"+problemId+"_"+userid+".log",function(){
				exec("cp ./logs/"+filename+".judge.txt ./results/"+filename+".judge.txt",function(){
					fs.readFile("logs/"+filename+".result.txt",function(err,result){
						fs.readFile("logs/"+filename+".running_time.txt",function(err,running_time){
							callback(parseInt(result),parseFloat(running_time));
						});
					});
				});
			});
		});
	});
}