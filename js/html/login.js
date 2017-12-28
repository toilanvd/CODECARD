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

document.getElementById("login").setAttribute("action","http://"+hostname+":"+port+"/login");
document.getElementById("signup").setAttribute("href","http://"+hostname+":"+port+"/signup");