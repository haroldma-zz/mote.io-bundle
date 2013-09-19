exec(function(){

	var parts = window.location.pathname.split("/");

	if(parts[1] == "explore") {

	  // actual client code
	  window.moteioConfig = {
	    api_version: '0.1',
	    app_name: 'SoundCloud',
	    display_input: true,
	    action: 'listening to',
	    twitter: 'soundcloud',
	    init: function() {
	      window.jQ('.carousel').eq(0).find('.sc-button-play').click();
	    },
	    update: function(force) {
	      if($('.playControl').hasClass('playing')) {
	        window.moteioRec.updateButton('play', 'pause', null, force);
	      } else {
	        window.moteioRec.updateButton('play', 'play', null, force);
	      }
	      window.moteioRec.notify(
	        $('.carousel.active .playing .carouselItem__info-user').text(),
	        $('.carousel.active .playing .carouselItem__info-title').text(),
	        $('.carousel.active .playing .image__full').attr('src'),
	        window.location.origin + $('.carousel.active .playing .carouselItem__info-title').attr('href'),
	        force);
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
	    action: 'listening to',
	    twitter: 'soundcloud',
	    update: function(force) {
	      if($('.playControl').hasClass('playing')) {
	        window.moteioRec.updateButton('play', 'pause', null, force);
	      } else {
	        window.moteioRec.updateButton('play', 'play', null, force);
	      }
	      window.moteioRec.notify(
	        $('.soundTitle.playing .soundTitle__username').text(),
	        $('.soundTitle.playing .soundTitle__title').text(),
	        $('.streamContext.playing .image__full').attr('src'),
	        window.location.origin + $('.soundTitle.playing .soundTitle__title').attr('href'),
	        force);
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

});
