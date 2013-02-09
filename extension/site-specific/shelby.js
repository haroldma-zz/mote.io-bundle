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
          window.location = $('.current').prev().find('.thumbnail').attr('href');
        },
        xpos: 20,
        ypos: 20,
      },
      'play': {
        down: function() {
          $('.play-pause').attr('id', 'play-pause');
          rec.simulateClick('play-pause');
        },
        xpos: 120,
        ypos: 20,
      },
      'next': {
        down: function() {
          window.location = $('.current').next().find('.thumbnail').attr('href');
        },
        xpos: 220,
        ypos: 20,
      },
      'mute': {
        down: function() {
          $('.volume').attr('id', 'volume');
          rec.simulateClick('volume');
        },
        xpos: 20,
        ypos: 120
      },
      'heart': {
        down: function() {
          $('.like').attr('id', 'like');
          rec.simulateClick('like');
        },
        xpos: 220,
        ypos: 120
      }
    }
  });