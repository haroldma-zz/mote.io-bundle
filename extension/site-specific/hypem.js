/*jslint node: true, maxerr: 50, indent: 2 */
"use strict";
var rec = new MoteioReceiver();
// custom sync scripts injected into dom
rec.debug = true;

function extractUrl(input) {
 // remove quotes and wrapping url()
 if (typeof input !== "undefined") {
  return input.replace(/"/g,"").replace(/url\(|\)$/ig, "");
 } else {
  return;
 }
}

var $ = jQuery;

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

// actual client code
rec.init({
  notify: {
    x: 0,
    y: 0
  },
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
});
