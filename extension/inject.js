// Executing an anonymous script
function exec(fn) {
   var script = document.createElement('script');
   script.setAttribute("type", "application/javascript");
   script.textContent = '(' + fn + ')();';
   document.documentElement.appendChild(script); // run the script
   document.documentElement.removeChild(script); // clean up
}

//var remote_location = "https://localhost:3000";
var remote_location = 'https://mote.io:443';

var extension_url = remote_location + "/js/plugin.js";

exec(function(){

  console.log(window.location.host)
  console.log(window.location.pathname)

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
      display_input: true,
      init: function() {
        if(!$('#playerPlay').hasClass('pause')) {
          $('#playerPlay').click();
        }
      },
      update: function(force) {

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
         window.moteioRec.updateButton('play', 'play', null, force);
        }
        if($('#playerPlay').hasClass('pause')) {
         window.moteioRec.updateButton('play', 'pause', null, force);
        }
        if($('#playerFav').hasClass('fav-on')) {
         window.moteioRec.updateButton('heart', null, '#ff0000', force);
        } else {
         window.moteioRec.updateButton('heart', null, '#434345', force);
        }

      },
      blocks: [
        {
          type: 'notify',
          share: true
        },
        {
          type: 'search',
          action: function(query) {
            window.location = "/search/" + encodeURIComponent(query) + "/1/";
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
          title: 'Change Playlist',
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
            /*,
            {
              optgroup: 'Me',
              text: 'Feed',
              action: function() {
                $('#user-menu-feed-link').click();
              }
            },
            {
              optgroup: 'Me',
              text: 'Favorites',
              action: function() {
                $('#menu-item-mytracks > a').click();
              }
            }
            */
          ]
        }
      ]
    }

  } else if(window.location.host == "grooveshark.com") {

    window.moteioConfig = {
      api_version: '0.1',
      app_name: 'Grooveshark',
      display_input: true,
      init: function() {

        function fireWhenReady() {

          if ($('.play-button').length) {

            // wait until element exists then wait an additional second for the click handler to be bound
            // this should actually test if the event exists, this is a lazy way out
            setTimeout(function(){
              $('.play-button').click();
            }, 1000);

          } else {

            setTimeout(fireWhenReady, 100);

          }

        }
        fireWhenReady();

      },
      update: function(force) {

        var thisArtist = $('.now-playing-link.artist').text(),
          thisSong = $('.now-playing-link.song').text(),
          thisImage = $('#now-playing-image').attr('src');

        window.moteioRec.notify(thisArtist, thisSong, thisImage);

        // transfer button states
        if($('#play-pause').hasClass('playing')) {
         window.moteioRec.updateButton('play', 'pause', null, force);
        }
        if($('#play-pause').hasClass('paused')) {
         window.moteioRec.updateButton('play', 'play', null, force);
        }

      },
      blocks: [
        {
          type: 'notify',
          share: true
        },
        {
          type: 'search',
          action: function(query) {
            if($('#play-pause').hasClass('playing')) {
              $('#play-pause').click();
            }
            window.location = "http://grooveshark.com/search?q=" + encodeURIComponent(query);
          }
        },
        {
          type: 'buttons',
          data: [
            {
              press: function () {
                $('#play-prev').click();
              },
              icon: 'backward',
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
              icon: 'forward',
              hash: 'next'
            }
          ]
        }
      ]
    }

  } else if(window.location.host == "soundcloud.com") {

    var parts = window.location.pathname.split("/");

    if(parts[1] == "explore") {

      // actual client code
      window.moteioConfig = {
        api_version: '0.1',
        app_name: 'SoundCloud',
        display_input: true,
        init: function() {
          window.jQ('.carousel').eq(0).find('.sc-button-play').click();
        },
        update: function(force) {
          if($('.playControl').hasClass('playing')) {
            window.moteioRec.updateButton('play', 'pause', null, force);
          } else {
            window.moteioRec.updateButton('play', 'play', null, force);
          }
          window.moteioRec.notify($('.carousel.active .playing .carouselItem__info-user').text(), $('.carousel.active .playing .carouselItem__info-title').text(), $('.carousel.active .playing .image__full').attr('src'), force);
        },
        blocks: [
          {
            type: 'notify',
            share: true
          },
          {
            type: 'search',
            action: function(query) {
              window.location = "/search/sounds?q=" + encodeURIComponent(query);
            }
          },
          {
            type: 'buttons',
            data: [
              {
                press: function () {
                  $('.skipControl__previous').click();
                },
                icon: 'backward',
                hash: 'back'
              },
              {
                press: function () {
                  $('.playControl').click();
                },
                icon: 'play',
                hash: 'play'
              },
              {
                press: function () {
                  $('.sc-button-like').click();
                },
                icon: 'heart',
                hash: 'heart'
              },
              {
                press: function () {
                  $('.skipControl__next').click();
                },
                icon: 'forward',
                hash: 'next'
              }
            ]
          },
          {
            type: 'buttons',
            data: [
              {
                press: function () {
                  if($('.carousel.active').length){
                    window.jQ('.carousel').eq(window.jQ('.carousel.active').index('.carousel') - 1).find('.sc-button-play').click();
                  } else {
                    window.jQ('.carousel').eq(0).find('.sc-button-play').click();
                  }
                },
                icon: 'chevron-left',
                hash: 'next'
              },
              {
                press: function () {
                  if($('.carousel.active').length){
                    window.jQ('.carousel').eq(window.jQ('.carousel.active').index('.carousel') + 1).find('.sc-button-play').click();
                  } else {
                    window.jQ('.carousel').eq(0).find('.sc-button-play').click();
                  }
                },
                icon: 'chevron-right',
                hash: 'heart'
              }
            ]
          },
          {
            type: 'select',
            title: 'Change Page',
            data: [
              {
                optgroup: 'Stream',
                text: 'Stream',
                action: function() {
                  window.location = "/stream";
                }
              },
              {
                optgroup: 'Explore',
                text: 'Everything',
                action: function() {
                  window.location = "/explore";
                }
              },
              {
                optgroup: 'Explore',
                text: 'Urban',
                action: function() {
                  window.location = "/explore/urban";
                }
              },
              {
                optgroup: 'Explore',
                text: 'Metal',
                action: function() {
                  window.location = "/explore/metal";
                }
              },
              {
                optgroup: 'Explore',
                text: 'Pop',
                action: function() {
                  window.location = "/explore/pop";
                }
              },
              {
                optgroup: 'Explore',
                text: 'Electronic',
                action: function() {
                  window.location = "/explore/electronic";
                }
              },
              {
                optgroup: 'Explore',
                text: 'Classical',
                action: function() {
                  window.location = "/explore/classical";
                }
              },
              {
                optgroup: 'Explore',
                text: 'World',
                action: function() {
                  window.location = "/explore/world";
                }
              },
              {
                optgroup: 'Explore',
                text: 'Rock',
                action: function() {
                  window.location = "/explore/rock";
                }
              },
              {
                optgroup: 'Explore',
                text: 'Reggae',
                action: function() {
                  window.location = "/explore/reggae";
                }
              },
              {
                optgroup: 'Explore',
                text: 'Storytelling',
                action: function() {
                  window.location = "/explore/storytelling";
                }
              },
              {
                optgroup: 'Explore',
                text: 'Learning',
                action: function() {
                  window.location = "/explore/learning";
                }
              },
              {
                optgroup: 'Explore',
                text: 'Sports',
                action: function() {
                  window.location = "/explore/sports";
                }
              },
              {
                optgroup: 'Explore',
                text: 'News',
                action: function() {
                  window.location = "/explore/news";
                }
              },
              {
                optgroup: 'Explore',
                text: 'Books',
                action: function() {
                  window.location = "/explore/books";
                }
              },
              {
                optgroup: 'Explore',
                text: 'Arts and Entertainment',
                action: function() {
                  window.location = "/explore/arts%2Bentertainment";
                }
              },
              {
                optgroup: 'Explore',
                text: 'Comedy',
                action: function() {
                  window.location = "/explore/comedy";
                }
              },
              {
                optgroup: 'Explore',
                text: 'Business & Technology',
                action: function() {
                  window.location = "/explore/business%2Btechnology";
                }
              }
            ]
          }
        ]
      }

    } else {

      // actual client code
      window.moteioConfig = {
        api_version: '0.1',
        app_name: 'SoundCloud',
        display_input: true,
        update: function(force) {
          if($('.playControl').hasClass('playing')) {
            window.moteioRec.updateButton('play', 'pause', null, force);
          } else {
            window.moteioRec.updateButton('play', 'play', null, force);
          }
          window.moteioRec.notify($('.soundTitle.playing .soundTitle__username').text(), $('.soundTitle.playing .soundTitle__title').text(), $('.streamContext.playing .image__full').attr('src'), force);
        },
        blocks: [
          {
            type: 'notify',
            share: true
          },
          {
            type: 'search',
            action: function(query) {
              window.location = "/search/sounds?q=" + encodeURIComponent(query);
            }
          },
          {
            type: 'buttons',
            data: [
              {
                press: function () {
                  $('.skipControl__previous').click();
                },
                icon: 'backward',
                hash: 'back'
              },
              {
                press: function () {
                  $('.playControl').click();
                },
                icon: 'play',
                hash: 'play'
              },
              {
                press: function () {
                  $('.sc-button-like').click();
                },
                icon: 'heart',
                hash: 'heart'
              },
              {
                press: function () {
                  $('.skipControl__next').click();
                },
                icon: 'forward',
                hash: 'next'
              }
            ]
          },
          {
            type: 'select',
            title: 'Change Page',
            data: [
              {
                optgroup: 'Stream',
                text: 'Stream',
                action: function() {
                  window.location = "/stream";
                }
              },
              {
                optgroup: 'Explore',
                text: 'Everything',
                action: function() {
                  window.location = "/explore";
                }
              },
              {
                optgroup: 'Explore',
                text: 'Urban',
                action: function() {
                  window.location = "/explore/urban";
                }
              },
              {
                optgroup: 'Explore',
                text: 'Metal',
                action: function() {
                  window.location = "/explore/metal";
                }
              },
              {
                optgroup: 'Explore',
                text: 'Pop',
                action: function() {
                  window.location = "/explore/pop";
                }
              },
              {
                optgroup: 'Explore',
                text: 'Electronic',
                action: function() {
                  window.location = "/explore/electronic";
                }
              },
              {
                optgroup: 'Explore',
                text: 'Classical',
                action: function() {
                  window.location = "/explore/classical";
                }
              },
              {
                optgroup: 'Explore',
                text: 'World',
                action: function() {
                  window.location = "/explore/world";
                }
              },
              {
                optgroup: 'Explore',
                text: 'Rock',
                action: function() {
                  window.location = "/explore/rock";
                }
              },
              {
                optgroup: 'Explore',
                text: 'Reggae',
                action: function() {
                  window.location = "/explore/reggae";
                }
              },
              {
                optgroup: 'Explore',
                text: 'Storytelling',
                action: function() {
                  window.location = "/explore/storytelling";
                }
              },
              {
                optgroup: 'Explore',
                text: 'Learning',
                action: function() {
                  window.location = "/explore/learning";
                }
              },
              {
                optgroup: 'Explore',
                text: 'Sports',
                action: function() {
                  window.location = "/explore/sports";
                }
              },
              {
                optgroup: 'Explore',
                text: 'News',
                action: function() {
                  window.location = "/explore/news";
                }
              },
              {
                optgroup: 'Explore',
                text: 'Books',
                action: function() {
                  window.location = "/explore/books";
                }
              },
              {
                optgroup: 'Explore',
                text: 'Arts and Entertainment',
                action: function() {
                  window.location = "/explore/arts%2Bentertainment";
                }
              },
              {
                optgroup: 'Explore',
                text: 'Comedy',
                action: function() {
                  window.location = "/explore/comedy";
                }
              },
              {
                optgroup: 'Explore',
                text: 'Business & Technology',
                action: function() {
                  window.location = "/explore/business%2Btechnology";
                }
              }
            ]
          }
        ]
      }

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

    // actual client code
    window.moteioConfig =
      {
        api_version: '0.1',
        app_name: 'Rdio',
        display_input: true,
        update: function(force) {
          if($('.play_pause').hasClass('playing')) {
            window.moteioRec.updateButton('play', 'pause', null, force);
          } else {
            window.moteioRec.updateButton('play', 'play', null, force);
          }
          window.moteioRec.notify($('.text_metadata .artist_title').text(), $('.text_metadata .song_title').text(), $('.art').prop('src'), force);
        },
        blocks: [
          {
            type: 'notify',
            share: true
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
        update: function(force) {
          window.moteioRec.notify('Connected Established!', 'Tap to launch Homebase.', 'http://www.terrariaonline.com/attachments/success-kid-jpg.33785/', force);
        },
        blocks: [
          {
            type: 'notify',
            share: false
          },
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

  } else if (window.location.host == "xxxmovies.netflix.com") {


    // actual client code
    window.moteioConfig =
      {
        api_version: '0.1',
        app_name: 'Netflix',
        display_input: true,
        update: function(force) {

        },
        blocks: [
          {
            type: 'notify',
            share: false
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

    // actual client code
    window.moteioConfig =
      {
        api_version: '0.1',
        app_name: 'Pandora',
        display_input: true,
        update: function(force) {

          var thisArtist = $('.playerBarSong').text(),
            thisSong = $('.playerBarArtist').text(),
            thisImage = $('.playerBarArt').prop('src');
            window.moteioRec.notify(thisArtist, thisSong, thisImage, force);

          // transfer button states
          if($('.pauseButton').is(':visible')) {
            window.moteioRec.updateButton('play', 'pause', null, force);
          } else {
            window.moteioRec.updateButton('play', 'play', null, force);
          }

          if($('.thumbDownButton').hasClass('indicator')){
            window.moteioRec.updateButton('down', null, '#f28141', force);
          } else {
            window.moteioRec.updateButton('down', null, '#434345', force);
          }

          if($('.thumbUpButton').hasClass('indicator')){
            window.moteioRec.updateButton('up', null, '#f28141', force);
          } else {
            window.moteioRec.updateButton('up', null, '#434345', force);
          }

        },
        blocks: [
          {
            type: 'notify',
            share: true
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

    // actual client code
    window.moteioConfig =
      {
        api_version: '0.1',
        app_name: 'Vimeo',
        display_input: true,
        update: function(force) {
          if($('.play_pause_button').hasClass('playing')) {
            window.moteioRec.updateButton('play', 'pause', null, force);
          } else {
            window.moteioRec.updateButton('play', 'play', null, force);
          }
          if($('.like').hasClass('on')) {
           window.moteioRec.updateButton('heart', null, '#ff0000', force);
          } else {
           window.moteioRec.updateButton('heart', null, '#434345', force);
          }
          window.moteioRec.notify($('.info').find('hgroup h1').text(), $('.info').find('hgroup h2').text(), $('.info').find('img').prop('src'), force);
        },
        blocks: [
          {
            type: 'notify',
            share: true
          },
          {
            type: 'buttons',
            data: [
              {
                press: function () {
                  $('.play_pause_button').click();
                },
                icon: 'play',
                hash: 'play'
              },
              {
                press: function () {
                  if($('#login_lightbox').is(':visible')){
                    $('#lightbox_overlay').click();
                  } else {
                    $('.like').click();
                  }
                },
                icon: 'heart',
                hash: 'heart'
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
