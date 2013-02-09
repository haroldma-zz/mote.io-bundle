var isPlaying = false;
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
      'previous': {
        down: function() {
					app.simulateClick('previousButton');
        },
        xpos: 20,
        ypos: 20,
      },
      'play': {
        down: function() {
					if(isPlaying){
						app.simulateClick('playButton');
					} else {
						app.simulateClick('pauseButton');
					}
        },
        xpos: 120,
        ypos: 20,
      },
      'next': {
        down: function() {
					app.simulateClick('nextButton');
        },
        xpos: 220,
        ypos: 20,
      }
    }
  });