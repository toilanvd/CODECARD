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
document.getElementById("home-quick-button").setAttribute("src","../media/home_quick_button.png");

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

document.getElementById("livestream").setAttribute("href","http://"+hostname+":"+port+"/livestream");

function random_3_cards(player){
	var content = httpGet("http://"+hostname+":"+port+"/random_three_cards/"+player);
	document.getElementById("player"+player+"_3_cards").innerHTML = content;
}

document.getElementById("judging_submissions").innerHTML = httpGet("http://"+hostname+":"+port+"/check_judging_submissions");
document.getElementById("delete_logs").setAttribute("action","http://"+hostname+":"+port+"/delete_logs");

document.getElementById("combat_generator_open").setAttribute("action","http://"+hostname+":"+port+"/combat_generator_open");
document.getElementById("combat_generator_close").setAttribute("action","http://"+hostname+":"+port+"/combat_generator_close");
document.getElementById("challenge_status_open").setAttribute("action","http://"+hostname+":"+port+"/challenge_status_open");
document.getElementById("challenge_status_close").setAttribute("action","http://"+hostname+":"+port+"/challenge_status_close");
document.getElementById("add_custom_combat").setAttribute("action","http://"+hostname+":"+port+"/add_custom_combat");

document.getElementById("delete_all_cookies").setAttribute("action","http://"+hostname+":"+port+"/delete_all_cookies");

document.getElementById("delete_an_user").setAttribute("action","http://"+hostname+":"+port+"/delete_an_user");

document.getElementById("add_card").setAttribute("action","http://"+hostname+":"+port+"/add_card");

document.getElementById("cardDropdown").innerHTML = httpGet("http://"+hostname+":"+port+"/getCardDropdown");
document.getElementById("delete_card").setAttribute("action","http://"+hostname+":"+port+"/delete_card");

document.getElementById("all_cards").innerHTML = httpGet("http://"+hostname+":"+port+"/getAllCardsInfo");

document.getElementById("problem_algoDropdown").innerHTML = httpGet("http://"+hostname+":"+port+"/getAlgoDropdown");
document.getElementById("add_problem").setAttribute("action","http://"+hostname+":"+port+"/add_problem");

document.getElementById("delete_problem").setAttribute("action","http://"+hostname+":"+port+"/delete_problem");

document.getElementById("add_algorithm").setAttribute("action","http://"+hostname+":"+port+"/add_algorithm");

document.getElementById("algorithm_algoDropdown").innerHTML = httpGet("http://"+hostname+":"+port+"/getAlgoDropdown");
document.getElementById("delete_algorithm").setAttribute("action","http://"+hostname+":"+port+"/delete_algorithm");

document.getElementById("all_algorithms").innerHTML = httpGet("http://"+hostname+":"+port+"/getAllAlgorithmsInfo");

document.getElementById("all_algocond").innerHTML = httpGet("http://"+hostname+":"+port+"/getAllAlgoCondInfo");
document.getElementById("addAlgoCond_algoDropdown1").innerHTML = httpGet("http://"+hostname+":"+port+"/getAlgoDropdown");
document.getElementById("addAlgoCond_algoDropdown2").innerHTML = httpGet("http://"+hostname+":"+port+"/getAlgoDropdown");
document.getElementById("add_algocond").setAttribute("action","http://"+hostname+":"+port+"/add_algocond");
document.getElementById("deleteAlgoCond_algoDropdown1").innerHTML = httpGet("http://"+hostname+":"+port+"/getAlgoDropdown");
document.getElementById("deleteAlgoCond_algoDropdown2").innerHTML = httpGet("http://"+hostname+":"+port+"/getAlgoDropdown");
document.getElementById("delete_algocond").setAttribute("action","http://"+hostname+":"+port+"/delete_algocond");
