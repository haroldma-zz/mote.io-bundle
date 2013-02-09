var MoteioReceiver = function() {

	var self = this;
  self.remote_location = 'http://mote.io:8080';
  
  self.channel = null;
  self.bouncer = io.connect(self.remote_location + '/moteio-bouncer');

  self.params = {};

	self.debug = false;
  self.devices = [];

  self.set = function(property, value) {
    localStorage.setItem(property, JSON.stringify(value));
  }
  self.get = function(property) {
    var item = JSON.parse(localStorage.getItem(property));
    if (typeof item !== undefined) {
      return item; 
    } else {
      return false;
    }
  }
  self.remove = function(property) {
    localStorage.removeItem(property);
  }
  self.clear = function() {
    localStorage.clear(); 
  }

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
        $('#moteio-icon').removeClass('gotData');
	  	} else {
	  		toCall = buttonFunct.up;
        $('#moteio-icon').addClass('gotData');
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

  self.simulateClick = function(elementId) {
    var evt = document.createEvent('MouseEvents');
    evt.initMouseEvent('click', true, false,  document, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    document.getElementById(elementId).dispatchEvent(evt);
  };

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

  self.sync = function(show_key, show_request_access) {

    self.bouncer.emit('start-sync', self.get('uid'), function(err, key){
      show_key(err, key);
    });

    self.channel.on('request-access', function(device) {
      show_request_access(device);
    });
  
  };

  self.establish = function(uuid, holla) {

    console.log('establishing')
    self.channel.emit('establish-sync', uuid, function(err, res){
      holla();
    });

  };

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

  self.notify = function(message, image) {
    
    self.clog('notify')
    data = {
      message: message,
      image: image
    }
    self.channel.emit('notify', data, function(){
      self.clog('cb')
    });

  };

  self.changePage = function(pageID) {
    $('.moteio-page').hide();
    $(pageID).show();
  }

  self.startSync = function() {

    self.sync(
      function(key) {
        $('#moteio-qrcode').find('canvas').remove();
        $('#moteio-qrcode').qrcode({width: 220,height: 220,text: key});
      },
      function(device) {
        
        console.log(device)

        // establish right away
        self.establish(device.uuid, function(err, res){
          self.clog('connection established');
          self.changePage('#moteio-icon');
          self.showAlert('none', '<strong>'  + device.name + '</strong> ' + device.platform + ' ' + device.version + ' connected!');
        });;

        // this is an advanced feature that lets you approve devices
        // $('#moteio-devices-list').empty().append('<div class="moteio-device"><h3>'+device.name+'</h3><p>'+device.platform+' ' + device.version + '</p></div><div class="moteio-accept-deny"><a class="moteio-deny-request" data-device-uuid="'+device.uuid+'" href="#">Deny</a><a class="moteio-accept-request" data-device-uuid="'+device.uuid+'" href="#">Allow</a></div>');
      });
  }

  self.drawOverlay = function(hasRun) {

    $('.start-sync').click(function(){
      console.log('clicked');
    });
    $('#moteio-devices').on('click', '.moteio-accept-request', function(){
      console.log('clicked')
      self.changePage('#moteio-icon');
      self.establish($(this).attr('data-device-uuid'), function(err, res){
        self.clog('connection established');
      });
    });
    $('#moteio-devices').on('click', '.moteio-deny-request', function(){
      self.changePage('#moteio-icon');
        self.clog('connection denied');
    });
    $('#notify').click(function(){
      self.notify('something happened', null);
    });

    self.bindTriggerSync($('#moteio-icon'));
    self.bindTriggerSync($('#moteio-new'));

    if(hasRun){
      $('#moteio-icon').show();
    } else {
      $('#moteio-new').show();
    }

    $('.moteio-page').hover(function(){
      $(this).addClass('over');
    },function(){
      $(this).removeClass('over');
    });


  };

  self.showAlert = function(type, message) {
    $('#moteio-alert').addClass('moteio-alert-type-'+type).html(message).delay(50).fadeIn().delay(5000).fadeOut();
  }

  self.bindTriggerSync = function(e) {
    e.click(function(){
      self.startSync();
      self.changePage('#moteio-sync');
    })
  }

  self.init = function(params) {

    $(document).ready(function() {

      self.params = params;
      self.clear();
      hasRun = self.get('hasRun');
      if (!hasRun) {

        self.clog('first run!');
        self.set('hasRun', true);
    
        self.bouncer.emit('generate-uid', null, function(err, uid){
          self.set('uid', uid);
          self.listen(self.get('uid'));
        });

      } else {
        self.listen(self.get('uid'));
      }

      self.drawOverlay(hasRun);

    });

  };

};