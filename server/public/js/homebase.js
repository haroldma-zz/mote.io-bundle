(function($){

    var $apps = $('#apps li:not(.soon)'),
      appsPerRow = 2,
      currentApp = 0,
      loading = $('#loading');

    window.get_ls = function(property) {
      var item = JSON.parse(localStorage.getItem(property));
      if (typeof item !== undefined) {
        return item;
      } else {
        return false;
      }
    }

    window.showLoading = function() {
      loading.show();
    }

    window.hideLoading = function() {
      loading.hide();
    }

    window.selectApp = function(i) {
      currentApp = i;
      $apps.removeClass('selected');
      console.log(currentApp)
      console.log($apps)
      $($apps[currentApp]).addClass('selected');
    }

    window.launchApp = function(i) {
      window.showLoading();
      window.location = $($apps[currentApp]).find('a').prop('href');
    }

    window.launchSelectedApp = function() {
      window.launchApp(currentApp);
    }

    window.move = function(spot) {
      console.log('spot should be ' + spot)
      if (spot < 0) {
        spot = 0;
      }
      if (spot >= $apps.length) {
        spot = $apps.length - 1;
      }
      window.selectApp(spot);
    }

    window.moveUp = function() {
      window.move(currentApp - appsPerRow);
    }
    window.moveLeft = function() {
      window.move(currentApp - 1);
    }
    window.moveDown = function() {
      window.move(currentApp + appsPerRow);
    }
    window.moveRight = function() {
      window.move(currentApp + 1);
    }

    window.init = function() {
      selectApp(currentApp);
    }

    // actual client code
    window.moteioConfig =
      {
        api_version: '0.1',
        app_name: 'Homebase',
        blocks: [
          {
            type: 'notify'
          },
          {
            type: 'buttons',
            data: [
              {
                press: function () {
                  window.moveUp();
                },
                icon: 'chevron-up'
              }
            ]
          },
          {
            type: 'buttons',
            data: [
              {
                press: function () {
                  window.moveLeft();
                },
                icon: 'chevron-left'
              },
              {
                press: function () {
                  window.launchSelectedApp();
                },
                icon: 'circle-blank'
              },
              {
                press: function () {
                  window.moveRight();
                },
                icon: 'chevron-right'
              }
            ]
          },
          {
            type: 'buttons',
            data: [
              {
                press: function () {
                  window.moveDown();
                },
                icon: 'chevron-down'
              }
            ]
          }
        ]
      }

    console.log($apps)
    window.init();

})(jQuery);
