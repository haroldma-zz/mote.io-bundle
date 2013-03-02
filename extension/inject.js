// Append a script from a file in your extension
function appendScript(scriptFile) {
   var script = document.createElement('script');
   script.setAttribute("type", "application/javascript");
   script.setAttribute("src", chrome.extension.getURL(scriptFile));
   document.documentElement.appendChild(script); // run the script
}

appendScript('moteio.js');
