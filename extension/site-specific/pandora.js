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
      'play': {
        down: function() {
          if(isPlaying){
            $('.pauseButton').attr('id', 'pauseButton');
            rec.simulateClick('pauseButton');
            isPlaying = false;
          } else {
            $('.playButton').attr('id', 'playButton');
            rec.simulateClick('playButton');
            isPlaying = true;
          }
        },
        xpos: 120,
        ypos: 20,
      },
      'next': {
        down: function() {
          $('.skipButton').attr('id', 'skipButton');
          rec.simulateClick('skipButton');
        },
        xpos: 220,
        ypos: 20,
      },
      'up': {
        down: function() {
          $('.thumbUpButton').attr('id', 'thumbUpButton');
          rec.simulateClick('thumbUpButton');
        },
        xpos: 20,
        ypos: 120
      },
      'down': {
        down: function() {
          $('.thumbDownButton').attr('id', 'thumbDownButton');
          rec.simulateClick('thumbDownButton');
        },
        xpos: 120,
        ypos: 120
      }
    }
  });