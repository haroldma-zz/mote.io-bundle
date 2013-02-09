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
					$('#player_previous').click();
        },
        xpos: 20,
        ypos: 20,
      },
      'play': {
        down: function() {
          $('#player_play_pause').click();
        },
        xpos: 120,
        ypos: 20,
      },
      'next': {
        down: function() {
          $('#player_next').click();
        },
        xpos: 220,
        ypos: 20,
      }
    }
  });