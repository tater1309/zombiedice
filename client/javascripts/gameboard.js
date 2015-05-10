var socket;

var main = function() {
	"use strict";
	
	//keeping track of players
	var currentsid,
		currplayer = "",
		numberofbrains = 0,
		numberofshotguns = 0;

	socket = io('http://localhost:3000/ingame');

	//roll event gets json of dice roll and emits to both players the results
	$('#roll').click(function(){
		console.log('roll click works');
		$.getJSON('/rolldice', function(dicestats){
			//console.log('Brains ' + dicestats.dice10);
			//rollClicked(dicestats.dice10, dicestats.dice20, dicestats.dice30);
			socket.emit('diceroll', dicestats);
		});

		///have currentsid 

	});

	//plan to give other player the turn and freeze buttons not working 
	$('#stop').click(function(){
		//add up the brains 
		socket.emit('stopScore', currentsid);
	});

	
	//appends dice results to gameboard for both players
	socket.on('dicerollresult', function(dices, images) {
		console.log('data results received');
		$("div.dice1").text("Rolling...");
	    $("div.dice2").text("Rolling...");
	    $("div.dice3").text("Rolling...");


	    $("div.dice1").html(images[0]);
	    $("div.dice1_label").html(dices.dice10);
	    
	    $("div.dice2").html(images[1]);
	    $("div.dice2_label").html(dices.dice20);

	    $("div.dice3").html(images[2]);
	    $("div.dice3_label").html(dices.dice30);

	});


    $("div.brains").text("Brains: 0");
    $("div.shotguns").text("Shotguns: 0");

    //counts the number of brains & shotguns to display
	socket.on('countScore', function(data){
		$("div.brains").html("");
		$("div.shotguns").html("");

		numberofshotguns = numberofshotguns + data.shotgun;
		numberofbrains = numberofbrains + data.brain;

		checkStats();

		$("div.brains").text('Brains: ' + numberofbrains);
		$("div.shotguns").text('Shotguns: ' + numberofshotguns);
	});



	//fucntion will check if brains == 13(5 for now) || shotguns == 3 
	//end turn or keep rolling kk
	function checkStats(){
		if(numberofbrains >= 5){
			///game won 
			$("div.winner").text('Winner ' + currplayer);
			socket.emit('winner', currentsid);
			//socket.emit('stopScore', currentsid);
		}
		else if(numberofshotguns >= 3){
			//game over reset numberofshotgun & number of brains
			$("div.gameOver").text('Death by Shotgun: ' + currplayer);
			numberofshotguns = 0;
			numberofbrains = 0;
			socket.emit('stopScore', currentsid);
		}
		else{
			///nothing 
		}
	}



	//Login
	$("#lobbyreturn").click(function() {
		$(location).attr('href', "/lobby");
	});

	socket.on('handshake', function(sid, username, ret) {
		console.log("handshake received from " + sid);
		$("#opponentid").val(sid);
		$("#opponentname").empty();
		$("#opponentname").append(username);
		if (ret === 0) {
			socket.emit("return handshake", sid);
		}
	});

	//zombie challenge human -> human turn 
	socket.on('Player', function(sid, username){
		currentsid = sid;  //got the sid of current player 
		currplayer = username;
		console.log('Currentsid ' + sid);
		console.log('Turn: ' + username);
		$("div.playing").html("");
		$("div.playing").text("Turn: " + username);
		$("div.turn").html("");
		$("div.turn").text("Turn: " + username);
	});


	//enable buttons for player who is waiting for his turn
	socket.on('enable', function() {
		document.getElementById('roll').disabled = false;
		document.getElementById('stop').disabled = false;
		console.log('enable buttons');
	});


	//disable buttons for player who is waiting for his turn
	socket.on('disable', function() {
		document.getElementById('roll').disabled = true;
		document.getElementById('stop').disabled = true;
		console.log('disabled buttons');
	});

}

$(document).ready(main);
