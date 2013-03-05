res = {
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

var MoteioReceiver = function() {

  var self = this;

  // Server to listen to.  Is this still up?
  self.remote_location = 'http://lvh.me:8080';

  self.channel = null;

  // Connect to socket.io
  self.bouncer = io.connect(self.remote_location + '/moteio-bouncer');

  self.params = {};

  self.debug = false;
  self.devices = [];

  // Set specific property of MoteioReceiver object
  self.set = function(property, value) {
    localStorage.setItem(property, JSON.stringify(value));
  }

  // Get specific property of MoteioReceiver object
  // Returns false if property undefined
  self.get = function(property) {
    var item = JSON.parse(localStorage.getItem(property));
    if (typeof item !== undefined) {
      return item;
    } else {
      return false;
    }
  }

  // Remove item from localstorage
  self.remove = function(property) {
    localStorage.removeItem(property);
  }
  // Delete everything in ls
  self.clear = function() {
    localStorage.clear();
  }

  // Press a button.
  // var button = which button# was pressed
  // var down = event phase? down/up?
  self.triggerInput = function(button, down) {

    var toCall = null;
    console.log(button);
    buttonFunct = self.params.buttons[button] || null;

    if(!buttonFunct){
      if(down){
        self.clog('button #' + button + ' has no methods set for onInput().', 3);
      }
    } else {

      if (down) {
        toCall = buttonFunct.down;
        $j('#moteio-icon').removeClass('gotData');
      } else {
        toCall = buttonFunct.up;
        $j('#moteio-icon').addClass('gotData');
      }

      toCall = toCall || null;

      if(toCall){
        toCall();
      } else {
        if (down){
          self.clog('No method set for down input on button ' + button, 2);
        } else {
          self.clog('No method set for up input on button ' + button, 2);
        }
      }

    }

  };

  // Trigger a click on whatever page is being controlled.
  // var elementId = element on the page to click
  self.simulateClick = function(elementId) {
    var evt = document.createEvent('MouseEvents');
    evt.initMouseEvent('click', true, false,  document, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    document.getElementById(elementId).dispatchEvent(evt);
  };

  // Fancy console logs
  self.clog = function(description, level) {

    var level = level || 1;
    if (self.debug && console && console.log) {
      var message  = [];
      message.push('[mote.io]');
      switch (level){
      case 3:
        message.push('Error:');
        break;
      case 2:
        message.push('Warning: ');
        break;
      default:
        message.push('Notice: ');
        break;
      }
      message.push(description);
      console.log(message.join(' '));
    }

  };

  // Sync to the server
  self.sync = function(show_key, show_request_access) {

    // first function gets a key
    self.bouncer.emit('start-sync', self.get('uid'), function(err, key){
      show_key(err, key);
    });

    // second function is what to do when phone approves
    self.channel.on('request-access', function(device) {
      show_request_access(device);
    });

  };

  // Establish connection.
  // Run callback holla() on response
  self.establish = function(uuid, holla) {

    console.log('establishing')
    self.channel.emit('establish-sync', uuid, function(err, res){
      holla();
    });

  };

  // Listen to channel uid
  self.listen = function(uid) {

    self.clog('listening to channel ' + uid);
    self.channel = io.connect(self.remote_location + '/' + uid);

    self.channel.on('connect', function () {

      self.clog('connected');
      self.channel.emit('start', null, function (key) {
        self.clog('started');
        self.clog(key);
      });

    });

    self.channel.emit('set-config', {params: self.params, uid: self.get('uid')}, function(err, res){
      self.clog('configuration set');
      console.log(err);
      console.log(res);
    });

    self.channel.on('input', function (data) {
      console.log(data);
      self.triggerInput(data.button, data.down);
    });

  };

  // Notify the server of stuff.
  self.notify = function(line1, line2, image) {

    self.clog('notify')
    data = {
      line1: line1,
      line2: line2,
      image: image
    }
    self.channel.emit('notify', data, function(){
      self.clog('cb');
    });

  };

  self.updateButton = function(id, icon, color) {

    self.clog('update button')
    data = {
      id: id,
      icon: icon,
      color: color
    }

    self.channel.emit('update-button', data, function(){
      self.clog('cbb');
    })

  }

  // Errr... Changes what page is displaying somewhere?
  self.changePage = function(pageID) {
    $j('.moteio-page').hide();
    if (pageID == "#moteio-sync") {
      $j('#moteio-blackout').fadeIn();
    } else {
      $j('#moteio-blackout').fadeOut();
    }
    $j(pageID).show();
  }

  // QR sync
  self.startSync = function() {

    self.sync(
      function(key) {
        $j('#moteio-qrcode').find('canvas').remove();
        // $j('#moteio-qrcode').qrcode({width: 200, height: 200, text: key});
        $j('#moteio-sync').text('{"format": "QR_CODE", "text": "' + key + '"}');
      },
      function(device) {

        console.log(device)

        // establish right away
        self.establish(device.uuid, function(err, res){
          self.clog('connection established');
          self.changePage('#moteio-icon');
        });;

      });
  }

  // Draw overlay on page for QR code
  self.drawOverlay = function() {

    $j('body').append(' \
    <div id="moteio"> \
      <div id="moteio-new" class="moteio-page"> \
        <h1>Use your phone as a remote control!</h1> \
        <h2>Click here to get started now.</h2> \
      </div> \
      <div id="moteio-icon" class="moteio-page"></div> \
      <div id="moteio-sync" class="moteio-page"> \
        <p>Scan this code with the mote.io mobile app! Get it now for <a href="#">Android</a>.</p> \
        <div id="moteio-qrcode"></div> \
      </div> \
      <div id="moteio-devices" class="moteio-page"> \
          <h2>A new device wants to sync!</h2> \
          <div id="moteio-devices-list"></div> \
        </div> \
      </div> \
      <div id="moteio-alert" class="moteio-page"></div> \
    </div> \
    <div id="moteio-blackout"> \
    </div>');

    $j('.start-sync').click(function(){
      console.log('clicked');
    });
    $j('#moteio-devices').on('click', '.moteio-accept-request', function(){
      console.log('clicked')
      self.changePage('#moteio-icon');
      self.establish($j(this).attr('data-device-uuid'), function(err, res){
        self.clog('connection established');
      });
    });
    $j('#moteio-devices').on('click', '.moteio-deny-request', function(){
      self.changePage('#moteio-icon');
        self.clog('connection denied');
    });

    self.bindTriggerSync($j('#moteio-icon'));
    self.bindTriggerSync($j('#moteio-new'));

    // Shows either way. If block seems unnecesary?
    $j('#moteio-icon').show();

    $j('.moteio-page').hover(function(){
      $j(this).addClass('over');
    },function(){
      $j(this).removeClass('over');
    });

    $j('#moteio-blackout').click(function(){
      $j(this).fadeOut();
      self.changePage('#moteio-icon');
    });

  };

  // Add alert to the page
  self.showAlert = function(type, message) {
    $j('#moteio-alert').addClass('moteio-alert-type-'+type).html(message).delay(50).fadeIn();
  }

  self.bindTriggerSync = function(e) {
    e.click(function(){
      self.startSync();
      self.changePage('#moteio-sync');
    })
  }

  // Initialize new MoteioReceiver object with specified params object
  // Send message to server  and set listeners up if it's the first run.
  // If not first run, just listen.  Draw overlay regardless.
  self.init = function(params) {

    $j(document).ready(function() {

      self.clog('uid is' + self.get('uid'));

      self.params = params;

      self.clog(self.get('uid'));

      // reset to test sync process
      self.clear();

      if (self.get('uid')) {

        self.listen(self.get('uid'));

      } else {

        self.clog('first run!');

        self.bouncer.emit('generate-uid', null, function(err, uid){
          self.set('uid', uid);
          self.clog('uid set!')
          self.listen(self.get('uid'));
        });

      }

      self.drawOverlay();

    });

  };

};

var rec = new MoteioReceiver();
rec.init(res)

