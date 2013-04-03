// Executing an anonymous script
function exec(fn) {
   var script = document.createElement('script');
   script.setAttribute("type", "application/javascript");
   script.textContent = '(' + fn + ')();';
   document.documentElement.appendChild(script); // run the script
   document.documentElement.removeChild(script); // clean up
}

var remote_location = "http://lvh.me:3000";

var extension_url = remote_location + "/js/plugin.js",
  css_url = remote_location + "/css/plugin.css"

exec(function(){

  console.log(window.location.host)

  if(window.location.host == "hypem.com") {

    setInterval(function(){

      var active = null;
      $(document).ready(function() {
        if($('.active-playing-green').length > 0) {
          active = $('.active-playing-green');
        } else {
          active = $($('.section-track')[0]);
        }
      });

      var thisArtist = $($('#player-nowplaying a')[3]).text(),
        thisSong = $($('#player-nowplaying a')[4]).text(),
        thisImage = extractUrl(active.find('.readpost > span').css('background-image'));
      rec.notify(thisArtist, thisSong, thisImage);

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
      api_version: '0.1',
      app_name: 'Hype Machine',
      blocks: [
        {
          type: 'notify'
        },
        {
          type: 'search',
          action: function(query) {
            $('#q').val(query);
            $('#g').click();
          }
        },
        {
          type: 'buttons',
          data: [
            {
              press: function () {
                rec.simulateClick('playerPrev');
              },
              icon: 'backward',
              hash: 'back'
            },
            {
              press: function () {
                rec.simulateClick('playerPlay');
              },
              icon: 'play',
              hash: 'play'
            },
            {
              press: function () {
                rec.simulateClick('playerFav');
              },
              icon: 'heart',
              hash: 'heart'
            },
            {
              press: function () {
                rec.simulateClick('playerNext');
              },
              icon: 'forward',
              hash: 'next'
            }
          ]
        },
        {
          type: 'select',
          data: [
            {
              optgroup: 'Latest',
              text: 'Latest',
              action: function() {
                window.location = "/latest";
              }
            },
            {
              optgroup: 'Latest',
              text: 'Freshest',
              action: function() {
                window.location = "/latest/fresh";
              }
            },
            {
              optgroup: 'Latest',
              text: 'Remixes Only',
              action: function() {
                window.location = "/latest/remix";
              }
            },
            {
              optgroup: 'Latest',
              text: 'No Remixes',
              action: function() {
                window.location = "/latest/noremix";
              }
            },
            {
              optgroup: 'Latest',
              text: 'Blogs in USA',
              action: function() {
                window.location = "/latest/us";
              }
            },
            {
              optgroup: 'Popular',
              text: 'Now',
              action: function() {
                window.location = "/popular";
              }
            },
            {
              optgroup: 'Popular',
              text: 'Last Week',
              action: function() {
                window.location = "/popular/lastweek";
              }
            },
            {
              optgroup: 'Popular',
              text: 'Remixes Only',
              action: function() {
                window.location = "/popular/remix";
              }
            },
            {
              optgroup: 'Popular',
              text: 'No Remixes',
              action: function() {
                window.location = "/popular/noremix";
              }
            },
            {
              optgroup: 'Popular',
              text: 'Artists',
              action: function() {
                window.location = "/popular/artists";
              }
            },
            {
              optgroup: 'Popular',
              text: 'On Twitter',
              action: function() {
                window.location = "/popular/twitter";
              }
            }
          ]
        }
      ]
    }


  } else if(window.location.host == "www.htmltetris.com") {

    // actual client code
    window.moteio_config = {
      api_version: '0.1',
      app_name: 'Tetris',
      blocks: [
        {
          type: 'buttons',
          data: [
            {
              press: function () {
                moves[4]();
              },
              icon: 'undo',
            },
            {
              press: function () {
                moves[5]();
              },
              icon: 'repeat',
            }
          ]
        },
        {
          type: 'buttons',
          data: [
            {
              press: function () {
                moves[0]();
              },
              icon: 'chevron-left'
            },
            {
              press: function () {
                moves[6]();
              },
              icon: 'circle-blank'
            },
            {
              press: function () {
                moves[2]();
              },
              icon: 'chevron-right'
            }
          ]
        }
      ]
    }

  } else {

    window.moteio_config = {
      api_version: '0.1',
      app_name: 'Grooveshark',
      blocks: [
        {
          type: 'search',
          action: function(query) {
            $('#q').val(query);
            $('#g').click();
          }
        },
        {
          type: 'buttons',
          data: [
            {
              press: function () {
                $('#play-prev').click();
              },
              icon: 'step-backward',
              hash: 'back'
            },
            {
              press: function () {
                $('#play-pause').click();
              },
              icon: 'play',
              hash: 'play'
            },
            {
              press: function () {
                $('#play-next').click();
              },
              icon: 'step-forward',
              hash: 'next'
            }
          ]
        },
        {
          type: 'select',
          data: [
            {
              optgroup: 'latest',
              text: 'Latest',
              action: function() {
                window.location = "/latest";
              }
            },
            {
              optgroup: 'latest',
              text: 'Freshest',
              action: function() {
                window.location = "/latest/fresh";
              }
            },
            {
              optgroup: 'latest',
              text: 'Remixes Only',
              action: function() {
                window.location = "/latest/remix";
              }
            },
            {
              optgroup: 'latest',
              text: 'No Remixes',
              action: function() {
                window.location = "/latest/noremix";
              }
            },
            {
              optgroup: 'latest',
              text: 'Blogs in USA',
              action: function() {
                window.location = "/latest/us";
              }
            }
          ]
        }
      ]
    }

    //

  }

});

exec((function() {

  function async_load(){

      var link = document.createElement("link");
      link.href = css_url;
      link.type = "text/css";
      link.rel = "stylesheet";
      document.getElementsByTagName("head")[0].appendChild(link);

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
