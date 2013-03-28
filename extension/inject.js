// Executing an anonymous script
function exec(fn) {
   var script = document.createElement('script');
   script.setAttribute("type", "application/javascript");
   script.textContent = '(' + fn + ')();';
   document.documentElement.appendChild(script); // run the script
   document.documentElement.removeChild(script); // clean up
}

var extension_url = chrome.extension.getURL('moteio.js');

exec(function(){

  console.log(window.location.host)

  if (window.location.host == "lvh.me:3000") {

    // actual client code
    window.moteio_config = {
      notify: {
        x: 0,
        y: 0
      },
      buttons: {
        'up': {
          down: function () {
            window.moveUp();
          },
          x: 132,
          y: 75,
          icon: 'chevron-up'
        },
        'down': {
          down: function () {
            window.moveDown();
          },
          x: 132,
          y: 225,
          icon: 'chevron-down'
        },
        'left': {
          down: function () {
            window.moveLeft();
          },
          x: 55,
          y: 150,
          icon: 'chevron-left'
        },
        'right': {
          down: function () {
            window.moveRight();
          },
          x: 210,
          y: 150,
          icon: 'chevron-right'
        },
        'select': {
          down: function () {
            window.launchSelectedApp();
          },
          x: 132,
          y: 150,
          icon: 'circle-blank'
        }
      }
    }

  } else {

    function extractUrl(input) {
     // remove quotes and wrapping url()
     if (typeof input !== "undefined") {
      return input.replace(/"/g,"").replace(/url\(|\)$/ig, "");
     } else {
      return;
     }
    }

    setInterval(function(){

      var active = null;
      if($('.active-playing-green').length > 0) {
        active = $('.active-playing-green');
      } else {
        active = $($('.section-track')[0]);
      }

      var thisArtist = $($('#player-nowplaying a')[3]).text();
      var thisSong = $($('#player-nowplaying a')[4]).text();
      rec.notify(thisArtist, thisSong, extractUrl(active.find('.readpost > span').css('background-image')));

      // transfer button states
      if($('#playerPlay').hasClass('play')) {
        rec.updateButton('play', 'play', null);
      }
      if($('#playerPlay').hasClass('pause')) {
        rec.updateButton('play', 'pause', null);
      }
      if($('#playerFav').hasClass('fav-on')) {
        rec.updateButton('heart', null, '#ff0000');
      } else {
        rec.updateButton('heart', null, '#434345');
      }

    }, 1000);

    window.moteio_config = {
      version: "0.1",
      notify: {
        x: 0,
        y: 0
      },
      selects: [
        {
          x: 0,
          y: 0,
          options: {
            'all': {
              optgroup: 'latest',
              text: 'Latest',
              action: function() {

              }
            },
            'fresh': {
              optgroup: 'latest',
              text: 'Freshest',
              action: function() {

              }
            },
            'remix': {
              optgroup: 'latest',
              text: 'Remixes Only',
              action: function() {

              }
            },
            'noremix': {
              optgroup: 'latest',
              text: 'No Remixes',
              action: function() {

              }
            },
            'blogs': {
              optgroup: 'latest',
              text: 'Blogs in USA',
              action: function() {

              }
            }
          }
        }
      ],
      buttons: {
        'backward': {
          down: function () {
            rec.simulateClick('playerPrev');
          },
          x: 20,
          y: 75,
          icon: 'backward'
        },
        'play': {
          down: function () {
            rec.simulateClick('playerPlay');
          },
          x: 95,
          y: 75,
          icon: 'play'
        },
        'heart': {
          down: function () {
            rec.simulateClick('playerFav');
          },
          x: 170,
          y: 75,
          icon: 'heart'
        },
        'forward': {
          down: function () {
            rec.simulateClick('playerNext');
          },
          x: 245,
          y: 75,
          icon: 'forward'
        }
      }
    }

  }

});

exec((function() {

  function async_load(){
      var s = document.createElement('script');
      s.type = 'text/javascript';
      s.async = true;
      s.src = extension_url;
      var x = document.getElementsByTagName('script')[0];
      x.parentNode.insertBefore(s, x);

  }
  if (window.attachEvent) {
      window.attachEvent('onload', async_load);
  } else {
      window.addEventListener('load', async_load, false);
  }

})());
