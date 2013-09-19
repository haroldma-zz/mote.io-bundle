exec(function(){

	window.moteioConfig =
	  {
	    api_version: '0.1',
	    app_name: 'Vimeo',
	    action: 'watching',
	    twitter: 'vimeo',
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
	      window.moteioRec.notify(
	        $('.info').find('hgroup h1').text(),
	        $($('.info').find('hgroup h2 a')[0]).text(),
	        $('.info').find('img').prop('src'),
	        window.location.href,
	        force);
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

});
