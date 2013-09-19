exec(function(){

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
	        share: false
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

});
