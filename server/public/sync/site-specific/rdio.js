app = new MoteioReceiver('testApp');
app.debug = true;

var isPlaying = false;

app.onInput(1, function(){
	app.simulateClick('previousButton');
});
app.onInput(2, function(){
	app.simulateClick('nextButton');
});
app.onInput(3, function(){
	if(isPlaying){
		app.simulateClick('playButton');
	} else {
		app.simulateClick('pauseButton');
	}
});