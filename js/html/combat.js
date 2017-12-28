var hostname = "codecard.cf";
var port = "80";

function httpGet(theUrl){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

var combatid = httpGet("http://"+hostname+":"+port+"/combat/finding_combat");

document.getElementById("home-quick-link").setAttribute("href","http://"+hostname+":"+port+"/");
document.getElementById("combat-quick-link").setAttribute("href","http://"+hostname+":"+port+"/combat_preparation");

var link0, link1, button0, button1, welcome_message;
var username = httpGet("http://"+hostname+":"+port+"/username");
if(username != ""){
	link0 = "http://"+hostname+":"+port+"/profile"; 
	button0 = "../media/profile_button.png";
	link1 = "http://"+hostname+":"+port+"/logout";
	button1 = "../media/logout_button.png";
	welcome_message = "Hello <b>"+username+"</b>!";
}
else{
	link0 = "http://"+hostname+":"+port+"/login";
	button0 = "../media/login_button.png";
	link1 = "http://"+hostname+":"+port+"/signup";
	button1 = "../media/signup_button.png";
	welcome_message = "<b>Welcome to CODECARD!</b>";
}

document.getElementById("welcome-message").innerHTML = welcome_message;
document.getElementById("login-profile-link").setAttribute("href",link0);
document.getElementById("login-profile-button").setAttribute("src",button0);
document.getElementById("signup-logout-link").setAttribute("href",link1);
document.getElementById("signup-logout-button").setAttribute("src",button1);

var problemid = httpGet("http://"+hostname+":"+port+"/combat/problemid/"+combatid);
document.getElementById("problemid").innerHTML = "Problem: <b>"+problemid+"</b>";

var problem_presentation = "<object data='http://"+hostname+":"+port+"/combat/get_problemset/"+combatid+"' type='application/pdf' class='problem-presentation'/><a href='https://docs.google.com/viewerng/viewer?url=http://"+hostname+":"+port+"/combat/get_problemset/"+combatid+"'>Read problemset</a></object>\n";
document.getElementById("problem-document-content").innerHTML = problem_presentation;

document.getElementById("download-grading-log").setAttribute("href","http://"+hostname+":"+port+"/combat/grading_log/"+combatid);
document.getElementById("download-grading-log").setAttribute("download",combatid+"_log.txt");

document.getElementById("submit-code").setAttribute("action","http://"+hostname+":"+port+"/combat/submit/"+combatid);

// get stable information
document.getElementById("user-card-frame").innerHTML =
	"<img id='user-card-image' class='card-image' src='http://"+hostname+":"+port+"/combat/mycard/"+combatid+"'>\n"+
	"<img id='user-card-image-popup' class='card-image-popup' src='http://"+hostname+":"+port+"/combat/mycard/"+combatid+"'>";
// document.getElementById("user-card-frame-popup").innerHTML =
// 	"<img id='user-card-image-background' class='card-image-background' src='http://"+hostname+":"+port+"/combat/mycard/"+combatid+"'>";
document.getElementById("opp-card-frame").innerHTML =
	"<img id='opp-card-image' class='card-image' src='http://"+hostname+":"+port+"/combat/oppcard/"+combatid+"'>\n"+
	"<img id='opp-card-image-popup' class='card-image-popup' src='http://"+hostname+":"+port+"/combat/oppcard/"+combatid+"'>";
// document.getElementById("opp-card-frame-popup").innerHTML =
// 	"<img id='opp-card-image-background' class='card-image-background' src='http://"+hostname+":"+port+"/combat/oppcard/"+combatid+"'>";

var problem_level = httpGet("http://"+hostname+":"+port+"/combat/level/"+combatid);
if(problem_level != "-1"){
	document.getElementById("level-image-frame").innerHTML =
		"<img class='level-image' src='http://"+hostname+":"+port+"/media/"+problem_level+"_stars.png'>";
	// document.getElementById("level-image-frame-popup").innerHTML =
	// 	"<img class='level-image-popup' src='http://"+hostname+":"+port+"/media/"+problem_level+"_stars.png'>";
}

var countdown_update = 5;
var grading_code;

function update_grading(){
	grading_code = httpGet("http://"+hostname+":"+port+"/combat/grading_code/"+combatid);
	var grading_num = httpGet("http://"+hostname+":"+port+"/combat/grading_num/"+combatid);
	var submission_left = httpGet("http://"+hostname+":"+port+"/combat/submission_left/"+combatid);
	if(parseInt(grading_code) == 0){
		document.getElementById("grading-status").innerHTML =
			"<p><b>STATUS: <span style='color:green'>OK</span></b> | "+grading_num+" received | "+submission_left+" left</p>\n"; 
	}
	else{
		document.getElementById("grading-status").innerHTML =
			"<p><b>STATUS: <span style='color:blue'>Status: " + grading_code + " testing</span></b> | "+grading_num+" received | "+submission_left+" left</p>\n";
	}

	// -----------------

	var grading_log = httpGet("http://"+hostname+":"+port+"/combat/grading_log/"+combatid);
	document.getElementById("grading-log").innerHTML = grading_log;

	var sources_and_results = httpGet("http://"+hostname+":"+port+"/combat/getSourcesAndResults/"+combatid);
	document.getElementById("sources-and-results").innerHTML = sources_and_results;
}

update_grading();

// update unstable information
var minute = -1, second = -1;

function update_infomation(){
	var userid = httpGet("http://"+hostname+":"+port+"/combat/myid/"+combatid);
	var oppid = httpGet("http://"+hostname+":"+port+"/combat/oppid/"+combatid);

	document.getElementById("userid-frame").innerHTML = "<marquee behavior='alternate' scrollamount='1'>"+"<a href='http://"+hostname+":"+port+"/user/"+userid+"'>"+userid+"</a>"+"</marquee>";
	// document.getElementById("userid-frame-popup").innerHTML = userid;

	document.getElementById("oppid-frame").innerHTML = "<marquee behavior='alternate' scrollamount='1'>"+"<a href='http://"+hostname+":"+port+"/user/"+oppid+"'>"+oppid+"</a>"+"</marquee>";
	// document.getElementById("oppid-frame-popup").innerHTML = oppid;

	if(userid != "undefined"){
		document.getElementById("userid-frame").setAttribute("style","overflow-x:hidden; overflow-y:hidden;color:green;");
		// document.getElementById("userid-frame-popup").setAttribute("style","color:green;");
	}
	if(oppid != "undefined"){
		document.getElementById("oppid-frame").setAttribute("style","overflow-x:hidden; overflow-y:hidden;color:red;");
		// document.getElementById("oppid-frame-popup").setAttribute("style","color:red;");
	}

	document.getElementById("user-card-image").src = "http://"+hostname+":"+port+"/combat/mycard/"+combatid+"?"+ new Date().getTime();
	document.getElementById("user-card-image-popup").src = "http://"+hostname+":"+port+"/combat/mycard/"+combatid+"?"+ new Date().getTime();
	// document.getElementById("user-card-image-background").src = "http://"+hostname+":"+port+"/combat/mycard/"+combatid+"?"+ new Date().getTime();
	document.getElementById("opp-card-image").src = "http://"+hostname+":"+port+"/combat/oppcard/"+combatid+"?"+ new Date().getTime();
	document.getElementById("opp-card-image-popup").src = "http://"+hostname+":"+port+"/combat/oppcard/"+combatid+"?"+ new Date().getTime();
	// document.getElementById("opp-card-image-background").src = "http://"+hostname+":"+port+"/combat/oppcard/"+combatid+"?"+ new Date().getTime();

	var timelimit = httpGet("http://"+hostname+":"+port+"/combat/timelimit/"+combatid);
	var memlimit = httpGet("http://"+hostname+":"+port+"/combat/memlimit/"+combatid);
	document.getElementById("timelimit-and-memlimit").innerHTML = "<p><b>TIME: </b>"+timelimit+"sec, <b>MEMORY: </b>"+memlimit+" MB</p>\n";

	var message = httpGet("http://"+hostname+":"+port+"/combat/message/"+combatid);
	if(message != "") alert(message);

	minute = parseInt(httpGet("http://"+hostname+":"+port+"/combat/minute/"+combatid));
	second = parseInt(httpGet("http://"+hostname+":"+port+"/combat/second/"+combatid));
	
	var INF = 1000000000;
	var user_score = httpGet("http://"+hostname+":"+port+"/combat/myscore/"+combatid);
	var opp_score = httpGet("http://"+hostname+":"+port+"/combat/oppscore/"+combatid);
	if(user_score <= INF/2){
		document.getElementById("user-full-score").innerHTML = user_score;
		// document.getElementById("user-full-score-popup").innerHTML = user_score;
	}
	else{
		document.getElementById("user-full-score").innerHTML = 'INF';
		// document.getElementById("user-full-score-popup").innerHTML = 'INF';
	}
	if(opp_score <= INF/2){
		document.getElementById("opp-full-score").innerHTML = opp_score;
		// document.getElementById("opp-full-score-popup").innerHTML = opp_score;
	}
	else{
		document.getElementById("opp-full-score").innerHTML = 'INF';
		// document.getElementById("opp-full-score-popup").innerHTML = 'INF';
	}

	var user_solved_test_percentage = httpGet("http://"+hostname+":"+port+"/combat/my_original_score/"+combatid);
	var opp_solved_test_percentage = httpGet("http://"+hostname+":"+port+"/combat/opp_original_score/"+combatid);
	document.getElementById("user-original-score").innerHTML = '('+user_solved_test_percentage+')';
	// document.getElementById("user-original-score-popup").innerHTML = '('+user_solved_test_percentage+')';
	document.getElementById("opp-original-score").innerHTML = '('+opp_solved_test_percentage+')';
	// document.getElementById("opp-original-score-popup").innerHTML = '('+opp_solved_test_percentage+')';

	var download_solution_permission = httpGet("http://"+hostname+":"+port+"/combat/check_download_solution/"+combatid);
	if(download_solution_permission == "YES"){
		document.getElementById("download-solution-frame").innerHTML = 
		"<a href='http://" + hostname + ':' + port + "/combat/download_solution/" + combatid + "'>" + 
			"<img src='../media/download_solution.png' class='download-solution-available-button-image'>" + "</a>\n";
	}
	else{
		document.getElementById("download-solution-frame").innerHTML = 
		"<img src='../media/download_solution.png' class='download-solution-unavailable-button-image'>\n";
	}

	var change_problem_permission = httpGet("http://"+hostname+":"+port+"/combat/check_change_problem/"+combatid);
	if(change_problem_permission == "YES"){
		document.getElementById("change-problem-frame").innerHTML = 
		"<a href='http://" + hostname + ':' + port + "/combat/change_problem/" + combatid + "'>" + 
			"<img src='../media/change_problem.png' class='change-problem-available-button-image'>" + "</a>\n";
	}
	else{
		document.getElementById("change-problem-frame").innerHTML = 
		"<img src='../media/change_problem.png' class='change-problem-unavailable-button-image'>\n";
	}
}

update_infomation();
window.setInterval(function(){update_infomation();update_grading();},60000);

// update time
window.setInterval(function(){
	if(minute == -2){
		document.getElementById("time").innerHTML = "WAIT 3 MIN";
		// document.getElementById("time-popup").innerHTML = "WAIT 3 MIN";
		document.getElementById("time").setAttribute("style","color:blue;");
		// document.getElementById("time-popup").setAttribute("style","color:blue;");
	}
	else if(minute == -1){
		document.getElementById("time").innerHTML = "FULL TIME";
		// document.getElementById("time-popup").innerHTML = "FULL TIME";
		document.getElementById("time").setAttribute("style","color:red;");
		// document.getElementById("time-popup").setAttribute("style","color:red;");
	}
	else{
		if(minute < 60) second = second + 1;
		if(second == 60){minute = minute + 1; second = 0;}

		if(minute < 10){
			document.getElementById("time").innerHTML = '0'+minute;
			// document.getElementById("time-popup").innerHTML = '0'+minute;
		}
		else{
			document.getElementById("time").innerHTML = minute;
			// document.getElementById("time-popup").innerHTML = minute;
		}
		document.getElementById("time").innerHTML += ':';
		// document.getElementById("time-popup").innerHTML += ':';
		if(second < 10){
			document.getElementById("time").innerHTML += '0'+second;
			// document.getElementById("time-popup").innerHTML += '0'+second;
		}
		else{
			document.getElementById("time").innerHTML += second;
			// document.getElementById("time-popup").innerHTML += second;
		}
	}
},1000);

window.setInterval(function(){
	if(parseInt(grading_code) > 0 || countdown_update > 0){
		if(parseInt(grading_code) > 0) countdown_update = 5;
		else countdown_update = countdown_update - 1;

		update_grading();
		if(countdown_update == 3)
			document.getElementById("sources-and-results").scrollTop = document.getElementById("sources-and-results").scrollHeight;

		// This part can be remove if 'update_information()' has time interval = 1s
		minute = parseInt(httpGet("http://"+hostname+":"+port+"/combat/minute/"+combatid));
		second = parseInt(httpGet("http://"+hostname+":"+port+"/combat/second/"+combatid));

		var INF = 1000000000;
		var user_score = httpGet("http://"+hostname+":"+port+"/combat/myscore/"+combatid);
		var opp_score = httpGet("http://"+hostname+":"+port+"/combat/oppscore/"+combatid);
		if(user_score <= INF/2){
			document.getElementById("user-full-score").innerHTML = user_score;
			// document.getElementById("user-full-score-popup").innerHTML = user_score;
		}
		else{
			document.getElementById("user-full-score").innerHTML = 'INF';
			// document.getElementById("user-full-score-popup").innerHTML = 'INF';
		}
		if(opp_score <= INF/2){
			document.getElementById("opp-full-score").innerHTML = opp_score;
			// document.getElementById("opp-full-score-popup").innerHTML = opp_score;
		}
		else{
			document.getElementById("opp-full-score").innerHTML = 'INF';
			// document.getElementById("opp-full-score-popup").innerHTML = 'INF';
		}

		var user_solved_test_percentage = httpGet("http://"+hostname+":"+port+"/combat/my_original_score/"+combatid);
		var opp_solved_test_percentage = httpGet("http://"+hostname+":"+port+"/combat/opp_original_score/"+combatid);
		document.getElementById("user-original-score").innerHTML = '('+user_solved_test_percentage+')';
		// document.getElementById("user-original-score-popup").innerHTML = '('+user_solved_test_percentage+')';
		document.getElementById("opp-original-score").innerHTML = '('+opp_solved_test_percentage+')';
		// document.getElementById("opp-original-score-popup").innerHTML = '('+opp_solved_test_percentage+')';
		// ------------------------------------------------------------------------
	}
},1000);

// function show_background_popup(){
// 	document.getElementById("main-popup").setAttribute("style","display:block; filter:opacity(0%); -webkit-filter:opacity(0%); z-index: 1;");
// 	var opacity_timer = setInterval(function(){
// 		var opacity = document.getElementById("main-popup").style.filter;
// 		if(opacity!="" && parseInt(opacity.toString().split('(')[1].split('%')[0])<100)
// 			document.getElementById("main-popup").style.filter = "opacity("+(parseInt(opacity.toString().split('(')[1].split('%')[0])+1)+"%)";

// 		var webkitOpacity = document.getElementById("main-popup").style.webkitFilter;
// 		if(webkitOpacity!="" && parseInt(webkitOpacity.toString().split('(')[1].split('%')[0])<100)
// 			document.getElementById("main-popup").style.webkitFilter = "opacity("+(parseInt(webkitOpacity.toString().split('(')[1].split('%')[0])+1)+"%)";
// 	}, 20);
// 	setTimeout(function(){
// 		clearInterval(opacity_timer);
// 	}, 3000);
// }
// function hide_background_popup(){
// 	document.getElementById("main-popup").setAttribute("style","display:none;");
// }