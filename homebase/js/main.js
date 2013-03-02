(function($){

    var $apps = $('#apps li'),
      appsPerRow = 2,
      currentApp = 0;

    window.selectApp = function(i) {
      currentApp = i;
      console.log($apps);
      $apps.removeClass('selected');
      $($apps[currentApp]).addClass('selected');
    }

    window.move = function(spot) {
      console.log('spot should be ' + spot)
      if (spot < 0) {
        spot = 0;
      }
      if (spot >= $apps.length) {
        spot = $apps.length;
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

    window.init();

})(jQuery);
