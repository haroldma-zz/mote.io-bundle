
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
			    $('.previous_button:first').attr('id', 'previous_button');
			    rec.simulateClick('previous_button');
        },
        xpos: 20,
        ypos: 20,
      },
      'play': {
        down: function() {
			    $('.play_pause_button:first').attr('id', 'play_pause_button');
			    rec.simulateClick('play_pause_button');
        },
        xpos: 120,
        ypos: 20,
      },
      'next': {
        down: function() {
			    $('.next_button:first').attr('id', 'next_button');
			    rec.simulateClick('next_button');
        },
        xpos: 220,
        ypos: 20,
      }
    }
  });