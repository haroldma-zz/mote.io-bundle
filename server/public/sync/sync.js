var 
	rec = new MoteioReceiver();


	// custom sync scripts injected into dom
	rec.debug = true;

	// actual client code
	rec.init({
		theme : {
			notify_back: '#ccc',
			notify_text: '#111'
		},
		buttons: {
			'play': {
				down: function() {
					$('#play-button').click();
				},
				x: 40,
				y: 40
			}
		}
	});
	

