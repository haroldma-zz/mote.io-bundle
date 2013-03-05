// Append a script from a file in your extension
function appendScript(scriptFile) {
   var script = document.createElement('script');
   script.setAttribute("type", "application/javascript");
   script.setAttribute("src", chrome.extension.getURL(scriptFile));
   document.documentElement.appendChild(script); // run the script
}

appendScript('lib/jquery.js');
appendScript('lib/socket.io.js');
appendScript('lib/jquery.qrcode.min.js');
appendScript('moteio.js');


// Executing an anonymous script
function exec(fn) {
   var script = document.createElement('script');
   script.setAttribute("type", "application/javascript");
   script.textContent = '(' + fn + ')();';
   document.documentElement.appendChild(script); // run the script
   document.documentElement.removeChild(script); // clean up
}

script = function() {
  setInterval(function(){
    if($) {
      var j$ = $.noConflict();
      console.log('have jquery')
    }
    if(j$('body').qrcode('test')) {
      console.log('have qrcode')
    }
    if(io){
      console.log('have socket.io')
    }
  }, 2000)
}

exec(script);
