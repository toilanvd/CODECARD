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

var cardId = httpGet("http://"+hostname+":"+port+"/getCurrentGift");
if(cardId == "") window.location.replace("http://"+hostname+":"+port);
else if(cardId != "-1"){
	document.getElementById("gift-message").innerHTML = "<b>You received a card!</b>";

	document.getElementById("gift-card").innerHTML = "<img class='gift-image' src='/cards/effect/"+cardId+"'>\n";
	document.getElementById("gift-card").innerHTML += "<img id='unknown-card' style='filter:opacity(100%);-webkit-filter:opacity(100%);' class='unknown-card' src='/cards/unknown.jpg'>\n";
	document.getElementById("gift-card").innerHTML += "<div id='countdown' class='countdown'></div>";

	var cnt = 3;
	document.getElementById("countdown").innerHTML = cnt;
	var countdown = setInterval(function(){
		cnt = cnt-1;
		if(cnt > 0) 
			document.getElementById("countdown").innerHTML = cnt;
	}, 1000);

	function open_card(){
		document.getElementById("background").setAttribute("src","../media/background_gift.gif")

		var open_card_countdown = setInterval(function(){
			var opacity = document.getElementById("unknown-card").style.filter;
			if(opacity!="" && parseInt(opacity.toString().split('(')[1].split('%')[0])>0)
				document.getElementById("unknown-card").style.filter = "opacity("+(parseInt(opacity.toString().split('(')[1].split('%')[0])-1)+"%)";

			var webkitOpacity = document.getElementById("unknown-card").style.webkitFilter;
			if(webkitOpacity!="" && parseInt(webkitOpacity.toString().split('(')[1].split('%')[0])>0)
				document.getElementById("unknown-card").style.webkitFilter = "opacity("+(parseInt(webkitOpacity.toString().split('(')[1].split('%')[0])-1)+"%)";
		}, 20);

		setTimeout(function(){
			clearInterval(open_card_countdown);
		}, 3000);
	}

	setTimeout(function(){
		clearInterval(countdown);
		document.getElementById("countdown").innerHTML = '';
		open_card();
	}, 3000);
}
else{
	document.getElementById("gift-message").innerHTML = "<b>You don't receive any gift due to your card's effect!</b>";
	document.getElementById("gift-card").innerHTML = "<img class='gift-image' src='/cards/no_card.jpg'>\n";
}