var hostname = "codecard.cf";
var port = "80";

function httpGet(theUrl){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

function show_background_popup(){
	document.getElementById("background-popup").setAttribute("style","display: block; z-index: 1; filter: opacity(0%);");
	var opacity_timer = setInterval(function(){
		var opacity = document.getElementById("background-popup").style.filter;
		if(opacity!="" && parseInt(opacity.toString().split('(')[1].split('%')[0])<100)
			document.getElementById("background-popup").style.filter = "opacity("+(parseInt(opacity.toString().split('(')[1].split('%')[0])+1)+"%)";
	}, 20);
	setTimeout(function(){
		clearInterval(opacity_timer);
	}, 3000);
}
function hide_background_popup(){
	 document.getElementById("background-popup").setAttribute("style","display:none");
}

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

var problemId = httpGet("http://"+hostname+":"+port+"/problem/finding_problem");
if(problemId == "")	window.location.replace("http://"+hostname+":"+port);

document.getElementsByTagName("title")[0].innerHTML = "CODECARD - " + problemId;

var problem_presentation = "<object data='../problems/" + problemId + "/" + problemId+ ".pdf' type='application/pdf' class='problem-presentation'/><a href='https://docs.google.com/viewerng/viewer?url=http://"+hostname+':'+port+"/problems/" + problemId + "/" + problemId+ ".pdf'>Read problemset</a></object>\n";
document.getElementById("problem-document").innerHTML = problem_presentation;

var problem_ranking = httpGet("http://"+hostname+":"+port+"/problem/"+problemId+"/getProblemRanking");
document.getElementById("problem-ranking-content").innerHTML = problem_ranking;

document.getElementById("problem-name-and-level").innerHTML = "<span><b><u>"+problemId+"</u></b></span>";
var problemLevel = httpGet("http://"+hostname+":"+port+"/problem/"+problemId+"/level");
document.getElementById("problem-name-and-level").innerHTML += "<span> "+"<img class='problem-level' src='../media/"+problemLevel+"_stars.png'></span>";

document.getElementById("download-grading-log").setAttribute("href","http://"+hostname+":"+port+"/problem/"+problemId+"/grading_log");
document.getElementById("download-grading-log").setAttribute("download",problemId+"_log.txt");

var problem_source = httpGet("http://"+hostname+":"+port+"/problem/"+problemId+"/problem_source");
document.getElementById("problem-source").innerHTML = "<p><b>Source: </b>"+problem_source+"</p>\n";

function reload_status(){
	var timelimit = httpGet("http://"+hostname+":"+port+"/problem/"+problemId+"/timelimit");
	var memlimit = httpGet("http://"+hostname+":"+port+"/problem/"+problemId+"/memlimit");
	document.getElementById("timelimit-and-memlimit").innerHTML = "<p><b>TIME: </b>"+timelimit+"sec, <b>MEMORY: </b>"+memlimit+" MB</p>\n";

	var current_result = httpGet("http://"+hostname+":"+port+"/problem/"+problemId+"/current_result");
	document.getElementById("current-result").innerHTML = "<p><b>CURRENT RESULT: </b>"+current_result+"</p>\n";

	var max_result = httpGet("http://"+hostname+":"+port+"/problem/"+problemId+"/max_result");
	document.getElementById("max-result").innerHTML = "<p><b>MAXIMUM RESULT: </b>"+max_result+"</p>\n";

	var allow_download_solution = httpGet("http://"+hostname+":"+port+"/problem/"+problemId+"/check_free_solution");
	var allow_download_testdata = httpGet("http://"+hostname+":"+port+"/problem/"+problemId+"/check_free_testdata");

	if(allow_download_testdata == "YES" || parseInt(max_result) >= 70){
		document.getElementById("download-test").innerHTML = 
			"<a href='http://" + hostname + ':' + port + "/problems/" + problemId + "/" + problemId + ".zip'>" + 
				"<img src='../media/download_test.png' class='download-test-available-button-image'>" + "</a>\n"; 
	}
	else{
		document.getElementById("download-test").innerHTML = 
			"<img src='../media/download_test.png' class='download-test-unavailable-button-image'>\n";
	}

	if(allow_download_solution == "YES" || parseInt(max_result) >= 80){
		document.getElementById("download-solution").innerHTML = 
			"<a href='http://" + hostname + ':' + port + "/problems/" + problemId + "/" + problemId + "_solution.pdf'>" + 
				"<img src='../media/download_solution.png' class='download-solution-available-button-image'>" + "</a>\n"; 
	}
	else{
		document.getElementById("download-solution").innerHTML = 
			"<img src='../media/download_solution.png' class='download-solution-unavailable-button-image'>\n";
	}

	var receive_gift_permission = httpGet("http://"+hostname+":"+port+"/problem/"+problemId+"/check_received_gift");
	if(receive_gift_permission == "YES"){
		document.getElementById("receive-gift").innerHTML = 
			"<a href='http://" + hostname + ':' + port + "/problem/" + problemId + "/receive_gift'>" + 
				"<img src='../media/receive_gift.gif' class='receive-gift-available-button-image'>" + "</a>\n"; 
	}
	else{
		document.getElementById("receive-gift").innerHTML = 
			"<img src='../media/receive_gift.png' class='receive-gift-unavailable-button-image'>\n";
	}

	// -----------------

	var grading_code = httpGet("http://"+hostname+":"+port+"/problem/"+problemId+"/grading_code");
	var grading_num = httpGet("http://"+hostname+":"+port+"/problem/"+problemId+"/grading_num");
	if(parseInt(grading_code) == 0){
		document.getElementById("grading-status").innerHTML =
			"<p><b>STATUS: <span style='color:green'>OK</span></b> | "+grading_num+" received</p>\n"; 
	}
	else{
		document.getElementById("grading-status").innerHTML =
			"<p><b>STATUS: <span style='color:blue'>" + grading_code + " testing</span></b> | "+grading_num+" received</p>\n";
	}

	// -----------------

	var grading_log = httpGet("http://"+hostname+":"+port+"/problem/"+problemId+"/grading_log");
	document.getElementById("grading-log").innerHTML = grading_log;

	var sources_and_results = httpGet("http://"+hostname+":"+port+"/problem/"+problemId+"/getSourcesAndResults");
	document.getElementById("sources-and-results").innerHTML = sources_and_results;
}

reload_status();

document.getElementById("submit-code").setAttribute("action","http://"+hostname+":"+port+"/problem/"+problemId+"/submit");