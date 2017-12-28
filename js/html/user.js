var hostname = "codecard.cf";
var port = "80";

function httpGet(theUrl){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

var finding_user = httpGet("http://"+hostname+":"+port+"/finding_user");

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

///////// -- Load user combats
document.getElementById("user-combats-content").innerHTML = httpGet("http://"+hostname+":"+port+"/combat/getUserCombats/"+finding_user);

///////// -- Load user profile
document.getElementById("user-profile-content").innerHTML = httpGet("http://"+hostname+":"+port+"/getUserProfile/"+finding_user);

///////// -- Load user problems
document.getElementById("user-problems-content").innerHTML = httpGet("http://"+hostname+":"+port+"/get_all_problems_list/"+finding_user);

///////// -- Load cards

var number_of_cards = 27;

for(var k=0;k<number_of_cards;k+=8){
	var content = "";
	if(k==16){
		for(var i=16;i<=26;i++){
			content += "<div class='card'>\n";
			content += "<div class='card-image-frame'>\n";
			content += "<img id='card-"+i+"-image' class='card-image' onclick='choose_card("+i+")'>\n";
			content += "<img id='card-"+i+"' class='card-image-popup-fourth-row' src='http://"+hostname+":"+port+"/cards/effect/"+i+"'>\n";
			content += "</div>\n";
			content += "</div>\n";
			if(i==17) i = 20;
		}
		k = 19;
	}
	else{
		for(var i=k;i<k+8;i++){
			content += "<div class='card'>\n";
			content += "<div class='card-image-frame'>\n";
			content += "<img id='card-"+i+"-image' class='card-image' onclick='choose_card("+i+")'>\n";
			if(k==0) content += "<img id='card-"+i+"' class='card-image-popup-second-row' src='http://"+hostname+":"+port+"/cards/effect/"+i+"'>\n";
			else if(k==8) content += "<img id='card-"+i+"' class='card-image-popup-third-row' src='http://"+hostname+":"+port+"/cards/effect/"+i+"'>\n";
			content += "</div>\n";
			content += "</div>\n";
		}
	}

	if(k==0) document.getElementById("second-row").innerHTML = content;
	else if(k==8) document.getElementById("third-row").innerHTML = content;
	else document.getElementById("fourth-row").innerHTML = content;
}

for(var i=0;i<number_of_cards;i++){
	document.getElementById("card-"+i+"-image").setAttribute("src","http://"+hostname+":"+port+"/cards/possession/"+finding_user+"/"+i);
	document.getElementById("card-"+i).setAttribute("src","http://"+hostname+":"+port+"/cards/possession/"+finding_user+"/"+i);
}