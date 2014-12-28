moteio_app = function() {

  var self = this;

  self.date = new Date();

  mote.io.host = 'https://localhost:3000';
  //mote.io.host = 'https://moteiostaging-9163.onmodulus.net';
  // mote.io.host  = 'https://mote.io:443';
  mote.io.font_url = "//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css";
  mote.io.css_url = mote.io.host + "/css/plugin.css?_=" + self.date.getTime();
  mote.io.pubnub_url = "https://cdn.pubnub.com/pubnub-3.5.3.min.js";

  self.init = function() {

    var link = document.createElement("link");
    link.href = mote.io.font_url;
    link.type = "text/css";
    link.rel = "stylesheet";
    document.getElementsByTagName("head")[0].appendChild(link);

    var link = document.createElement("link");
    link.href = mote.io.css_url;
    link.type = "text/css";
    link.rel = "stylesheet";
    document.getElementsByTagName("head")[0].appendChild(link);

    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.src = mote.io.pubnub_url;
    var x = document.getElementsByTagName('script')[0];
    x.parentNode.insertBefore(s, x);

    function fireWhenReady() {

      if (typeof PUBNUB !== 'undefined' && mote.io.remote) {

        console.log('PUBNUB is ready')
        mote.io.receiver.init();

      } else {

        setTimeout(fireWhenReady, 100);

      }

    }

    fireWhenReady();

  }

};

moteio_receiver = function() {

  var self = this;

  self.debug = true;

  self.channel_name = null;
  self.pubnub = null;

  self.id = new Date().getTime() + Math.floor((Math.random()*100)+1);

  self.set = function(key, data) {
    // Put the object into storage
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  }

  self.get = function(key) {
    // Retrieve the object from storage
    var retrievedObject = localStorage.getItem(key);
    if (typeof retrievedObject !== "undefined") {
      return JSON.parse(retrievedObject);
    } else {
      return false;
    }
  }

  self.statusTextDisplay = function(message, href) {

    var href = href || null,
      message = message || null;

    self.clog('Writing Status: ' + message);

    jQ('#moteio-status').show();

    if (href) {
      jQ('#moteio-status-text').attr('href', href);
    } else {
      jQ('#moteio-status-text').removeAttr('href');
    }

    if (message) {
      jQ('#moteio-status-text-message').hide(function() {
        jQ('#moteio-status-text-message').html(message).show();
      });
    } else {
      jQ('moteio-status-text').hide();
    }

  }

  self.inputDisplay = function(icon, color) {

    jQ('#moteio-notice').hide();

    if (typeof mote.io.remote.display_input !== "undefined" && mote.io.remote.display_input) {

      var
      color = color || null,
        popup = jQ('<div class="moteio-container"><div class="moteio-button-popup"><span class="icon-' + icon + '"></span></div></div>');

      if (color) {
        popup.css('color', color);
      }

      jQ('.moteio-button-popup').remove();

      jQ('body').append(popup);

      popup.show().delay(800).fadeOut('normal', function() {
        jQ(this).remove();
      });

    }

  }

  // Press a button.
  self.triggerInput = function(data) {

    var toCall = null,
      buttonFunct = mote.io.remote.blocks[data.block_id].data[data._id] || null;

    if (!buttonFunct) {

      if (buttonFunct.press) {
        self.clog('button #' + button + ' has no methods set for button.data().', 3);
      }

    } else {

      if (data.press) {
        toCall = buttonFunct.press;
        self.inputDisplay(buttonFunct.icon)
      } else {
        toCall = buttonFunct.release;
      }

      toCall = toCall || null;

      if (toCall) {
        toCall();
      } else {
        if (data.press) {
          self.clog('No method set for press() input on button', 2);
        } else {
          self.clog('No method set for release() input on button', 2);
        }
      }

    }

  };

  // Trigger a click on whatever page is being controlled.
  // var elementId = element on the page to click
  self.simulateClick = function(elementId) {
    var evt = document.createEvent('MouseEvents');
    evt.initMouseEvent('click', true, false, document, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    document.getElementById(elementId).dispatchEvent(evt);
  };

  // Fancy console logs
  self.clog = function(description, level) {

    var level = level || 1;
    if (self.debug && console && console.log) {
      var message = [];
      message.push('[mote.io]');
      switch (level) {
      case 3:
        message.push('Error:');
        message.push(description);
        console.error(message.join(' '));
        break;
      case 2:
        message.push('Warning:');
        message.push(description);
        console.warn(message.join(' '));
        break;
      default:
        message.push('Notice:');
        message.push(description);
        console.log(message.join(' '));
        break;
      }
    }

  };

  self.goHome = function() {

    self.clog('Oh won\'t you take me home tonight. http://www.youtube.com/watch?v=rhKDV0QN4ew');

    self.inputDisplay('home');
    location = mote.io.host + "/homebase";

  }

  self.sendRemote = function() {

    self.clog('Sending Remote');
    console.log(mote.io.remote);

    self.pubnub.publish({
      channel: self.channel_name,
      message: {
        type: 'update-config',
        data: mote.io.remote,
        id: self.id
      }
    });

  }

  self.logout = function() {

    self.clog('Logging Out')

    self.pubnub.unsubscribe({
      channel: self.channel_name
    });
  }

  // Listen to channel uid
  self.listen = function(channel_name) {

    self.clog('Listening to channel.')

    self.channel_name = channel_name;

    self.pubnub.subscribe({
      channel: self.channel_name,
      message: function(message) {

        self.clog('Got message: ' + message.type);
        data = message.data;

        // this is another
        if (message.type == 'update-config') {

          if (self.id == message.id) {
            self.clog('Got kill request (update-config). Don\'t kill myself!');
          } else {
            self.clog('Got kill request. This isn\'t from me, farewell cruel world.');
            self.logout();
          }

        }

        if (message.type == 'get-config') {

          self.sendRemote();

        }

        if (message.type == 'got-config') {

          jQ('.moteio-state-not-signed-in').hide();
          jQ('.moteio-state-signed-in').show();
          jQ('#moteio-notice').removeClass('small');

          self.statusTextDisplay('Synced with phone!', 'https://mote.io/start');

          if ((location.host == "localhost:3000"
            || location.host == "mote.io"
            || location.host == "moteiostaging-9163.onmodulus.net")
            && location.pathname == "/start") {
            self.goHome();
          }

          if (typeof mote.io.remote.init !== "undefined") {
            self.clog('Calling init()')
            mote.io.remote.init();
          }

          if (typeof mote.io.remote.update !== "undefined") {

            self.clog('setInterval for update()')
            setInterval(function() {
              mote.io.remote.update();
            }, 1000);

            mote.io.remote.update(true);

          }

        }

        if (message.type == 'go-home') {
          self.goHome();
        }

        if (message.type == 'input') {
          self.triggerInput(data);
        }

        if (message.type == 'select') {

          self.clog('Got Select Input');

          self.clog(mote.io.remote.blocks[data.block_id].data[data._id].action());
          mote.io.remote.blocks[data.block_id].data[data._id].action();

        }

        if (message.type == 'search') {

          self.clog('Searching for ' + data.query);
          mote.io.remote.blocks[data.block_id].action(data.query);

        }

      },
      reconnect: function() {
        self.clog("Reconnected.");
        self.sendRemote();
      },
      connect: function() {

        self.clog('Connected');

        self.statusTextDisplay('Log in to the Mote.io mobile phone app!', 'https://mote.io/start');

        self.sendRemote();

      }

    });

  };

  // Notify the server of stuff.
  self.lastNotify = {}
  self.notify = function(line1, line2, image, permalink, force) {

    data = {
      line1: line1,
      line2: line2,
      image: image,
      permalink: permalink,
    }

    if (typeof force == "undefined") {
      force = false;
    }

    // do a check by default
    if ((self.lastNotify.line1 !== line1 || self.lastNotify.line2 !== line2 || self.lastImage !== image) || force) {

      self.pubnub.publish({
        channel: self.channel_name,
        message: {
          type: 'notify',
          data: data
        }
      });

      if(force) {
        self.clog('Notify text forced, sending update.');
      } else {
        self.clog('Notify text changed, sending update.');
      }

    } else {

    }

    self.lastNotify.line1 = data.line1;
    self.lastNotify.line2 = data.line2;
    self.lastImage = data.image;
    self.lastPermalink = data.permalink;

  };

  self.updateButton = function(hash, icon, color, force) {

    // self.clog(mote.io.remote);
    jQ.each(mote.io.remote.blocks, function(i, block) {

      if (mote.io.remote.blocks[i].type == "buttons") {

        jQ.each(mote.io.remote.blocks[i].data, function(j, block_data) {
          // self.clog(mote.io.remote.blocks[i].data[j])
          if (mote.io.remote.blocks[i].data[j].hash == hash) {

            // self.clog('hash is hash')
            // self.clog(mote.io.remote.blocks[i].data[j])
            var worthUpdating = false;

            if (force) {
              worthUpdating = true;
              // self.clog('forced')
            } else {
              if (typeof icon !== "undefined" && icon && mote.io.remote.blocks[i].data[j].icon !== icon) {
                mote.io.remote.blocks[i].data[j].icon = icon;
                worthUpdating = true;
                self.clog('Button icon changed to ' + icon)
              }
              if (typeof color !== "undefined" && color && mote.io.remote.blocks[i].data[j].color !== color) {
                mote.io.remote.blocks[i].data[j].color = color;
                worthUpdating = true;
                self.clog('Button color changed to ' + color);
              }

            }

            if (worthUpdating) {

              self.clog('Sending button update');

              self.pubnub.publish({
                channel: self.channel_name,
                message: {
                  type: 'update-button',
                  data: mote.io.remote.blocks[i].data[j]
                }
              });

            }

          }

        });

      }

    });

  }

  self.stop = function() {};

  self.start = function() {

    self.clog('!!! STARTING UP');

    jQ.ajax({
      url: mote.io.host + '/get/login/',
      xhrFields: {
        withCredentials: true
      },
      dataType: 'jsonp',
      success: function(data) {

        self.clog('Got login response');
        console.log(data)

        if (data.valid) {

          self.listen(data.channel_name);

        } else {

          self.statusTextDisplay('Click here to login!', mote.io.host + '/login');

        }
      },
      error: function(xhr, status) {
        console.log('error logging in')
        console.log(status)
      }
    });

  }

  self.jQueryReady = function() {

    jQ('.moteio-state-not-installed').hide();
    jQ('.moteio-state-installed').show();

    jQ('body').append(jQ('<div id="moteio-notice" class="moteio-container">\
      <div id="moteio-messages">\
      </div>\
      <div id="moteio-status">\
        <img id="moteio-round-logo" height="30" width="30" src="' + mote.io.host + '/images/144.png">\
        <a id="moteio-status-text">\
          <span id="moteio-status-text-message"><img id="moteio-loadio" src="' + mote.io.host + '/images/loading-searching.gif"></span>\
        </a>\
        <div class="moteio-hide"><span class="icon-remove"></span></div> \
      </div>\
    </div>'));

    jQ(window).focus(function() {
      jQ('#moteio-notice').fadeIn();
      self.start();
    });

    jQ('.moteio-hide').click(function() {
      jQ('#moteio-notice').addClass('small');
      self.set('moteio-hide', true);
    });

    jQ('#moteio-round-logo').click(function() {
      jQ('#moteio-notice').removeClass('small');
      self.set('moteio-hide', false);
    });

    if (self.get('moteio-hide')) {
      jQ('#moteio-notice').addClass('small');
    }

    self.pubnub = PUBNUB.init({
      publish_key: 'pub-2cc75d12-3c70-4599-babc-3e1d27fd1ad4',
      subscribe_key: 'sub-cfb3b894-0a2a-11e0-a510-1d92d9e0ffba',
      origin: 'pubsub.pubnub.com',
      ssl: true
    });

    self.pubnub.ready();
    self.start();

  }

  self.init = function() {

    var callback = function() {
      console.log('firing callback')
      mote.io.receiver.jQueryReady();
    }

    var script = document.createElement("script");
    script.setAttribute("src", "//ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js");
    script.addEventListener('load', function() {
      var script = document.createElement("script");
      script.textContent = "jQ=jQuery.noConflict(true);(" + callback.toString() + ")();";
      document.body.appendChild(script);
    }, false);
    document.body.appendChild(script);

  };

}

if(typeof mote == "undefined") {
  mote = {io: {}};
}

mote.io.app = new moteio_app();
mote.io.receiver = new moteio_receiver();

mote.io.updateButton = mote.io.receiver.updateButton;
mote.io.notify = mote.io.receiver.notify;

mote.io.app.init();
