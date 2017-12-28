var hostname = "codecard.cf";
var port = "80";

function httpGet(theUrl){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

var card_using = httpGet("http://"+hostname+":"+port+"/check_card_using");
var problem_level = httpGet("http://"+hostname+":"+port+"/check_choose_problem_level");
var start_combat_status = false;

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
document.getElementById("your-combats-content").innerHTML = httpGet("http://"+hostname+":"+port+"/combat/getUserCombats");

///////// -- Load user status
document.getElementById("users-status-content").innerHTML = httpGet("http://"+hostname+":"+port+"/combat/getUsersStatus");
window.setInterval(function() {
	document.getElementById("your-combats-content").innerHTML = httpGet("http://"+hostname+":"+port+"/combat/getUserCombats");
	document.getElementById("users-status-content").innerHTML = httpGet("http://"+hostname+":"+port+"/combat/getUsersStatus");
}, 60000);

var check_block_all_challenge = httpGet("http://"+hostname+":"+port+"/combat/check_block_all_challenge/");
if(check_block_all_challenge=="YES") document.getElementById("block_all").setAttribute("checked",true);
function toggle_block_all(checkbox){
	if(checkbox.checked == true) httpGet("http://"+hostname+":"+port+"/combat/block_all_challenge/");
	else httpGet("http://"+hostname+":"+port+"/combat/unblock_all_challenge/");
}

function toggle_block_user(checkbox){
	var blockid = checkbox.value;
	if(checkbox.checked == true) httpGet("http://"+hostname+":"+port+"/combat/block_challenge/"+blockid);
	else httpGet("http://"+hostname+":"+port+"/combat/unblock_challenge/"+blockid);
}

function send_challenge(opponent){
	var send_challenge_respond = httpGet("http://"+hostname+":"+port+"/combat/challenge/"+opponent.value);
	if(send_challenge_respond == "") opponent.innerHTML = 'OK';
	else if(send_challenge_respond == "still having combat")
		alert("Your current combat is not finished or you did not add last combat problem to free training!");
	else alert(send_challenge_respond);
}

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
			// content += "<div id='card-"+i+"-copy' class='card-copy'></div>\n";
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
			// content += "<div id='card-"+i+"-copy' class='card-copy'></div>\n";
			content += "</div>\n";
		}
	}

	if(k==0) document.getElementById("second-row").innerHTML = content;
	else if(k==8) document.getElementById("third-row").innerHTML = content;
	else document.getElementById("fourth-row").innerHTML = content;
}

for(var i=0;i<number_of_cards;i++){
	document.getElementById("card-"+i+"-image").setAttribute("src","http://"+hostname+":"+port+"/cards/effect/"+i);
	document.getElementById("card-"+i).setAttribute("src","http://"+hostname+":"+port+"/cards/effect/"+i);
	// var copy = httpGet("http://"+hostname+":"+port+"/cards/effect/"+i+"/copy");
	// if(copy != '0') document.getElementById("card-"+i+"-copy").innerHTML = copy;
}
//////////////// -- Card using

document.getElementById("card-using-image").setAttribute("src","http://"+hostname+":"+port+"/cards/effect/"+card_using);

function choose_card(cardid){
	if(!start_combat_status){
		if(card_using.toString()!=cardid.toString()){
			var copy = httpGet("http://"+hostname+":"+port+"/cards/effect/"+cardid+"/copy");
			if(copy!="0"){
				card_using = cardid;
				document.getElementById("card-using-image").setAttribute("src","http://"+hostname+":"+port+"/cards/effect/"+cardid);
				httpGet("http://"+hostname+":"+port+"/update_card_using/"+cardid);
			}
		}
	}
}
//////////// -- Level choosing
for(var i=1;i<=3;i++){
	document.getElementById("level-"+i).setAttribute("src","http://"+hostname+":"+port+"/media/"+i+"_stars_combat.png");
	if(i==parseInt(problem_level)) document.getElementById("level-"+i).setAttribute("style","");
	else document.getElementById("level-"+i).setAttribute("style","-webkit-filter: grayscale(100%);filter:grayscale(100%);");
}

function update_choose_problem_level(level){
	if(!start_combat_status){
		if(problem_level.toString()!=level.toString()){
			problem_level = level;
			for(var i=1;i<=3;i++){
				if(i==level) document.getElementById("level-"+i).setAttribute("style","");
				else document.getElementById("level-"+i).setAttribute("style","-webkit-filter: grayscale(100%);filter:grayscale(100%);");
			}
			httpGet("http://"+hostname+":"+port+"/update_choose_problem_level/"+level);
		}
	}
}

//////////// -- Start button
document.getElementById("start-button").setAttribute("src","http://"+hostname+":"+port+"/media/start_combat_button.png");
function combat_status_change(){
	// This function is not completed yet!
	if(start_combat_status){
		start_combat_status = false;
		document.getElementById("start-button").setAttribute("src","http://"+hostname+":"+port+"/media/start_combat_button.png");
		httpGet("http://"+hostname+":"+port+"/combat/stop_request");
	}
	else{
		start_combat_status = true;
		document.getElementById("start-button").setAttribute("src","http://"+hostname+":"+port+"/media/stop_combat_button.png");
	}
}
//////// -- Clock --
var minute = 0, second = 0;
window.setInterval(function() {
	if(!start_combat_status){
		minute = 0; second = 0;
		document.getElementById("waiting-time").innerHTML = "00:00";
	}
	else{
		// -- send combat request
		if(second%5==0){
			var next_combatid = httpGet("http://"+hostname+":"+port+"/combat/request");
			if(next_combatid == "still having combat"){
				combat_status_change();
				alert("Your current combat is not finished or you did not add last combat problem to free training!");
			}
			else if(next_combatid == "did not choose card"){
				combat_status_change();
				alert("You did not choose any card to play with!");
			}
		}

		// -- update time (after 1 second)
		second = (second + 1)%60;
		if(second == 0) minute++;
		if(minute == 2) combat_status_change();

		if(minute < 10 && second < 10) document.getElementById("waiting-time").innerHTML = '0'+minute+":0"+second;
		else if(minute < 10) document.getElementById("waiting-time").innerHTML = '0'+minute+":"+second;
		else if(second < 10) document.getElementById("waiting-time").innerHTML = minute+":0"+second;
		else document.getElementById("waiting-time").innerHTML = minute+":"+second;
	}
}, 1000);