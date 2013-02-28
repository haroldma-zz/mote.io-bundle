

/*jslint node: true, maxerr: 50, indent: 2 */
"use strict";
var rec = new MoteioReceiver();
// custom sync scripts injected into dom
rec.debug = true;

function extractUrl(input)
{
 // remove quotes and wrapping url()
 if (typeof input !== "undefined") {
  return input.replace(/"/g,"").replace(/url\(|\)$/ig, "");
 } else {
  return;
 }
}

var lastSong = null,
thisSong = null;

var $ = jQuery;

setInterval(function(){

  // watch for song updates
  console.log('checking for updates')
  console.log('this song is ' + thisSong);
  var thisArtist = $($('#player-nowplaying a')[2]).text();;
  var thisSong = $($('#player-nowplaying a')[3]).text();;
  if (thisSong !== lastSong) {
    console.log('!!!!!!!!!!!!!!!!!!! UPDATE')
    rec.notify(thisArtist, thisSong, extractUrl($('.active-playing-green').find('.readpost > span').css('background-image')));
    lastSong = thisSong;
  }

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

// actual client code
rec.init({
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
        if($('#playerFav').hasClass('fav-on')){
          rec.notify('Song Hearted!');
        } else {
          rec.notify('Song Unhearted! :(');
        }
        setTimeout(function(){
        }, 2000);
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
});
