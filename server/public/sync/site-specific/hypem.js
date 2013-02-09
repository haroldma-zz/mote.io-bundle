app = new MoteioReceiver('testApp');

app.debug = true;
app.onInput(1, function(){
	app.simulateClick('playerPrev');
});
app.onInput(2, function(){
	app.simulateClick('playerNext');
});
app.onInput(3, function(){
	app.simulateClick('playerPlay');
});
app.onInput(4, function(){
	app.simulateClick('playerFav');
});
app.clog('running');
