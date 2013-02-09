app = new MoteioReceiver('testApp');
app.debug = true;
app.onInput(1, function(){
	$('#player_previous').click();
});
app.onInput(2, function(){
	$('#player_next').click();
});
app.onInput(3, function(){
	$('#player_play_pause').click();
});
app.clog('running');