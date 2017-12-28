var hostname = "codecard.cf";
var port = "80";

function httpGet(theUrl){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

window.setInterval(function(){
	var combatid = httpGet("http://"+hostname+":"+port+"/combat/get_combat");
	if(combatid != ""){
		if(combatid.indexOf(" ")!=-1) alert(combatid);
		else window.location.href = "http://"+hostname+":"+port+"/combat/"+combatid;
	}
}, 5000);

window.setInterval(function(){
	var challenge = httpGet("http://"+hostname+":"+port+"/combat/get_challenge");
	if(challenge!=""){
		var oppid = challenge.split(" ")[0];
		var level = challenge.split(" ")[1];
		var accept_challenge = confirm("User '"+oppid+"' challenges you for a "+level+"-star combat. Accept?");
		if(accept_challenge){
			var accept_respond = httpGet("http://"+hostname+":"+port+"/combat/accept_challenge/"+oppid);
			alert(accept_respond);
		}
	}
}, 5000);

function show_background_popup(){
	document.getElementById("background-popup").setAttribute("style","display: block; z-index: 1; filter: opacity(0%); -webkit-filter: opacity(0%);");
	var opacity_timer = setInterval(function(){
		var opacity = document.getElementById("background-popup").style.filter;
		if(opacity!="" && parseInt(opacity.toString().split('(')[1].split('%')[0])<100)
			document.getElementById("background-popup").style.filter = "opacity("+(parseInt(opacity.toString().split('(')[1].split('%')[0])+1)+"%)";

		var webkitOpacity = document.getElementById("background-popup").style.webkitFilter;
		if(webkitOpacity!="" && parseInt(webkitOpacity.toString().split('(')[1].split('%')[0])<100)
			document.getElementById("background-popup").style.webkitFilter = "opacity("+(parseInt(webkitOpacity.toString().split('(')[1].split('%')[0])+1)+"%)";
	}, 20);
	setTimeout(function(){
		clearInterval(opacity_timer);
	}, 3000);
}
function hide_background_popup(){
	 document.getElementById("background-popup").setAttribute("style","display:none");
}

var userid = httpGet("http://"+hostname+":"+port+"/userid");
if(userid == "admin"){
	document.getElementById("home-quick-link").setAttribute("href","http://"+hostname+":"+port+"/admin");
	document.getElementById("home-quick-button").setAttribute("src","../media/admin_button.png");
}
else{
	document.getElementById("home-quick-link").setAttribute("href","http://"+hostname+":"+port+"/");
	document.getElementById("home-quick-button").setAttribute("src","../media/home_quick_button.png");
}

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

document.getElementById("introduction-link").setAttribute("href","http://"+hostname+":"+port+"/introduction");
document.getElementById("algotraining-link").setAttribute("href","http://"+hostname+":"+port+"/algotraining");
document.getElementById("freetraining-link").setAttribute("href","http://"+hostname+":"+port+"/freetraining");
document.getElementById("combat-link").setAttribute("href","http://"+hostname+":"+port+"/combat_preparation");
document.getElementById("gallery-link").setAttribute("href","http://"+hostname+":"+port+"/gallery");

var carousel_link = [];
carousel_link[1] = "";
carousel_link[2] = "";
carousel_link[3] = "";
carousel_link[4] = "";
carousel_link[5] = "";

function goto_link(num){
	if(carousel_link[num] != "") window.location.href = carousel_link[num];
}
// ---------
var slideIndex = 1;
showDivs(slideIndex);

function plusDivs(n) {
    showDivs(slideIndex += n);
}

function showDivs(n) {
    var i;
    var x = document.getElementsByClassName("notification-slide");
    if (n > x.length) {slideIndex = 1} 
    if (n < 1) {slideIndex = x.length} ;
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none"; 
    }
    x[slideIndex-1].style.display = "block"; 
}

setInterval(function(){plusDivs(+1);}, 5000);

function update_boards(){
	document.getElementById("banner-line-content").innerHTML = httpGet("http://"+hostname+":"+port+"/get_banner_line");
	document.getElementById("combat-board-content").innerHTML = httpGet("http://"+hostname+":"+port+"/get_all_combats");
	document.getElementById("ranking-board-content").innerHTML = httpGet("http://"+hostname+":"+port+"/user_ranking");
}
update_boards();
window.setInterval(function(){update_boards();},60000);