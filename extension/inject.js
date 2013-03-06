// Executing an anonymous script
function exec(fn) {
   var script = document.createElement('script');
   script.setAttribute("type", "application/javascript");
   script.textContent = '(' + fn + ')();';
   document.documentElement.appendChild(script); // run the script
   document.documentElement.removeChild(script); // clean up
}

var extension_url = chrome.extension.getURL('moteio.js');

exec(function(){

  window.res = {
    notify: {
      x: 0,
      y: 0
    },
    buttons: {
      'up': {
        down: function () {
          window.moveUp();
        },
        x: 20,
        y: 75,
        icon: 'chevron-up'
      },
      'down': {
        down: function () {
          window.moveDown();
        },
        x: 95,
        y: 75,
        icon: 'chevron-down'
      },
      'left': {
        down: function () {
          window.moveLeft();
        },
        x: 170,
        y: 75,
        icon: 'chevron-left'
      },
      'right': {
        down: function () {
          window.moveRight();
        },
        x: 245,
        y: 75,
        icon: 'chevron-right'
      }
    }
  }

})

exec((function() {

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

})());
