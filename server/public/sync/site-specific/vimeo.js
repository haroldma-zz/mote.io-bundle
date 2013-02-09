app = new MoteioReceiver('testApp');
app.debug = true;

console.log('!!!! VIMEO LOADED');

app.onInput(1, function(){
	console.log($('.'));
    $('.previous_button:first').attr('id', 'previous_button');
    app.simulateClick('previous_button');
});
app.onInput(2, function(){
    $('.next_button:first').attr('id', 'next_button');
    app.simulateClick('next_button');
});
app.onInput(3, function(){
    $('.play_pause_button:first').attr('id', 'play_pause_button');
    app.simulateClick('play_pause_button');
});
app.clog('running');