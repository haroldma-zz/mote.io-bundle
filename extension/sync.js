var 
	app = chrome.extension.getBackgroundPage();
	rec = new MoteioReceiver();

$(document).ready(function() {
	$('.start-sync').click(function(){
		console.log('clicked');
		rec.sync(
			function(key) {
				$('#sync-code').text(key);
			},
			function(device) {
				console.log('someone wants to sync with us')
				console.log(device)
				$('#devices').append('<a class="accept-request" data-device-uuid="'+device.uuid+'" href="#">'+device.name+'</a>');
			});
	});
	$('#devices').on('click', '.accept-request', function(){
		console.log('clicked')
		rec.establish($(this).attr('data-device-uuid'), function(err, res){
			alert('connection established!')
		});
	});

	rec.debug = true;
	rec.onInput(1, function(){
		console.log('1');
	});
	rec.onInput(2, function(){
		console.log('2');
	});
	rec.onInput(3, function(){
		console.log('3');
	});
	rec.onInput(4, function(){
		console.log('4');
	});
	rec.clog('running');
	rec.init();

});	