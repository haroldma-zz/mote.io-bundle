// Executing an anonymous script
function exec(fn) {
   var script = document.createElement('script');
   script.setAttribute("type", "application/javascript");
   script.textContent = '(' + fn + ')();';
   document.documentElement.appendChild(script); // run the script
   document.documentElement.removeChild(script); // clean up
}

var remote_location = "https://localhost:3000";
//var remote_location = 'https://mote.io';

var extension_url = remote_location + "/js/plugin.js",
  css_url = remote_location + "/css/plugin.css"

exec(function(){

  //console.log(window.location.host)
  //console.log(window.location.pathname)

  if(window.location.host == "hypem.com") {

    function extractUrl(input) {
      // remove quotes and wrapping url()
      if (typeof input !== "undefined") {
       return input.replace(/"/g,"").replace(/url\(|\)$/ig, "");
      } else {
       return;
      }
    }

    window.moteioConfig = {
      api_version: '0.1',
      app_name: 'Hype Machine',
      update: function() {

        console.log('updated')

        if($('.haarp-active.section-track').length > 0) {
          active = $('.haarp-active.section-track');
        } else {
          active = $($('.section-track')[0]);
        }

        var thisArtist = $($('#player-nowplaying a')[3]).text(),
          thisSong = $($('#player-nowplaying a')[4]).text(),
          thisImage = extractUrl(active.find('.readpost > span').css('background-image'));
          window.moteioRec.notify(thisArtist, thisSong, thisImage);

        // transfer button states
        if($('#playerPlay').hasClass('play')) {
         window.moteioRec.updateButton('play', 'play', null);
        }
        if($('#playerPlay').hasClass('pause')) {
         window.moteioRec.updateButton('play', 'pause', null);
        }
        if($('#playerFav').hasClass('fav-on')) {
         window.moteioRec.updateButton('heart', null, '#ff0000');
        } else {
         window.moteioRec.updateButton('heart', null, '#434345');
        }

      },
      blocks: [
        {
          type: 'notify'
        },
        {
          type: 'search',
          action: function(query) {
            $('#q').val(query);
            $('#g').click();
            setTimeout(function(){
              location.reload();
            }, 2000);
          }
        },
        {
          type: 'buttons',
          data: [
            {
              press: function () {
                $('#playerPrev').click();
              },
              icon: 'backward',
              hash: 'back'
            },
            {
              press: function () {
                $('#playerPlay').click();
              },
              icon: 'play',
              hash: 'play'
            },
            {
              press: function () {
                if($('#overlay').is(':visible')) {
                  $('#close').click();
                } else {
                  $('#playerFav').click();
                }
              },
              icon: 'heart',
              hash: 'heart'
            },
            {
              press: function () {
                $('#playerNext').click();
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
    window.moteioConfig = {
      api_version: '0.1',
      app_name: 'Tetris',
      blocks: [
        {
          type: 'buttons',
          data: [
            {
              press: function () {
                moves[5]();
              },
              icon: 'undo',
            },
            {
              press: function () {
                moves[4]();
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

  } else if (window.location.host == "www.rdio.com") {

    window.moteioUpdate = function() {
      window.moteioRec.notify($('.artist_title').text(), $('.song_title').text(), $('.album_icon').prop('src'));
      setTimeout(function(){
        window.moteioUpdate();
      }, 1000);
    }

    // actual client code
    window.moteioConfig =
      {
        api_version: '0.1',
        app_name: 'Rdio',
        blocks: [
          {
            type: 'notify'
          },
          {
            type: 'buttons',
            data: [
              {
                press: function () {
                  $('.prev').click();
                },
                icon: 'backward',
                hash: 'back'
              },
              {
                press: function () {
                  $('.play_pause').click();
                },
                icon: 'play',
                hash: 'play'
              },
              {
                press: function () {
                  $('.next').click();
                },
                icon: 'forward',
                hash: 'next'
              },
              {
                press: function () {
                  $('.shuffle').click();
                },
                icon: 'random',
                hash: 'random'
              }
            ]
          },
        ]
      }

    //


  } else if ((window.location.host == "mote.io" || window.location.host == "localhost:3000") && window.location.pathname == "/start") {

    // actual client code
    window.moteioConfig =
      {
        api_version: '0.1',
        app_name: 'Sync',
        blocks: [
          {
            type: 'buttons',
            data: [
              {
                press: function () {
                  return false;
                },
                icon: 'off'
              }
            ]
          }
        ]
      }

    //

  } else if (window.location.host == "http://reedditapp.com/") {

  } else if (window.location.host == "www.pandora.com") {

    function extractUrl(input) {
      // remove quotes and wrapping url()
      if (typeof input !== "undefined") {
       return input.replace(/"/g,"").replace(/url\(|\)$/ig, "");
      } else {
       return;
      }
    }

    window.moteioUpdate = function() {

       var thisArtist = $('.playerBarSong').text(),
         thisSong = $('.playerBarArtist').text(),
         thisImage = $('.playerBarArt').prop('src');
         window.moteioRec.notify(thisArtist, thisSong, thisImage);

      // transfer button states
      if($('.pauseButton').is(':visible')) {
        window.moteioRec.updateButton('play', 'pause', null);
      } else {
        window.moteioRec.updateButton('play', 'play', null);
      }

      if($('.thumbDownButton').hasClass('indicator')){
        window.moteioRec.updateButton('down', null, '#f28141');
      } else {
        window.moteioRec.updateButton('down', null, '#434345');
      }

      if($('.thumbUpButton').hasClass('indicator')){
        window.moteioRec.updateButton('up', null, '#f28141');
      } else {
        window.moteioRec.updateButton('up', null, '#434345');
      }

      setTimeout(function(){
        window.moteioUpdate();
      }, 1000);
    }

    // actual client code
    window.moteioConfig =
      {
        api_version: '0.1',
        app_name: 'Pandora',

        blocks: [
          {
            type: 'notify'
          },
          {
            type: 'buttons',
            data: [
              {
                press: function () {
                  $('.thumbDownButton a').click();
                },
                icon: 'thumbs-down',
                hash: 'down'
              },
              {
                press: function () {
                  $('.thumbUpButton a').click();
                },
                icon: 'thumbs-up',
                hash: 'up'
              },
              {
                press: function () {
                  if($('.pauseButton').is(':visible')){
                    $('.pauseButton a').click();
                  } else {
                    $('.playButton a').click();
                  }
                },
                icon: 'play',
                hash: 'play'
              },
              {
                press: function () {
                  $('.skipButton a').click();
                },
                icon: 'fast-forward',
                hash: 'skip'
              }
            ]
          },
        ]
      }

  } else if (window.location.host == "vimeo.com") {

    window.moteioUpdate = function() {
      window.moteioRec.notify($('.info').find('hgroup h1').text(), $('.info').find('hgroup h2').text(), $('.info').find('img').prop('src'));
      setTimeout(function(){
        window.moteioUpdate();
      }, 1000);
    }

    // actual client code
    window.moteioConfig =
      {
        api_version: '0.1',
        app_name: 'Vimeo',
        blocks: [
          {
            type: 'notify'
          },
          {
            type: 'buttons',
            data: [
              {
                press: function () {
                  $('.play_pause_button').click();
                },
                icon: 'play'
              },
              {
                press: function () {
                  if($('#login_lightbox').is(':visible')){
                    $('#lightbox_overlay').click();
                  } else {
                    $('.like').click();
                  }
                },
                icon: 'heart'
              },
              {
                press: function () {
                  if($('#login_lightbox').is(':visible')){
                    $('#lightbox_overlay').click();
                  } else {
                    $('.later').click();
                  }
                },
                icon: 'time'
              },
              {
                press: function () {
                  if($('#info_blanket').is(':visible')){
                    $('.click_catcher').click();
                  } else {
                    $('.info').click();
                  }
                },
                icon: 'info-sign'
              }
            ]
          },
          {
            type: 'buttons',
            data: [
              {
                press: function () {
                  $('.previous_button').click();
                },
                icon: 'fast-backward'
              },
              {
                press: function () {
                  $('.rewind_button').click();
                },
                icon: 'backward'
              },
              {
                press: function () {
                  $('.fast_forward_button').click();
                },
                icon: 'forward'
              },
              {
                press: function () {
                  $('.next_button').click();
                },
                icon: 'fast-forward'
              }
            ]
          }
        ]
      }

  }

});

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
