exec(function(){

	window.moteioConfig =
	  {
	    api_version: '0.1',
	    app_name: 'Youtube',
	    action: 'watching',
	    twitter: 'youtube',
	    display_input: true,
	    update: function(force) {

	      if(app.player.getPlayerState() == 1) {
	        window.moteioRec.updateButton('play', 'pause', null, force);
	      } else {
	        window.moteioRec.updateButton('play', 'play', null, force);
	      }

	      window.moteioRec.notify(
	        $('#video-category').text() + ' Videos',
	        $('#video-title').text(),
	        app.requests[app.activeCategory].results[app.player.getPlaylistIndex()]['media$group']['media$thumbnail'][0].url,
	        app.player.getVideoUrl(),
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
	            	app.previousVideo();
	            },
	            icon: 'fast-backward'
	          },
	          {
	            press: function () {
	            	 if(app.player.getPlayerState() == 1) {
	            	 	app.player.pauseVideo();
	            	 } else {
	            	 	app.player.playVideo();
	            	 }
	            },
	            icon: 'pause',
	            hash: 'play'
	          },
	          {
	            press: function () {
	            	app.nextVideo();
	            },
	            icon: 'fast-forward'
	          },
	          {
	            press: function () {
	            	app.showInfo();
	            },
	            icon: 'info-sign'
	          }
	        ]
	      }
	    ]
	  }

});
