/*jslint indent: 2 */

var io = io || null,
  localStorage = localStorage || null,
  console = console || null,
  navigator = navigator || null,
  $ = $ || null,
  device = device,
  window = window || null;

var App = function () {

  "use strict";

  var self = this;

  self.remote_location = 'http://lvh.me:8080';
  self.bouncer = io.connect(self.remote_location + '/moteio-bouncer');
  self.channel = null;

  // Set specific property of MoteioReceiver object
  self.set = function (property, value) {
    localStorage.setItem(property, JSON.stringify(value));
  };

  // Get specific property of MoteioReceiver object
  // Returns false if property undefined
  self.get = function (property) {
    var item = JSON.parse(localStorage.getItem(property));
    if (typeof item !== undefined) {
      return item;
    } else {
      return false;
    }
  };

  // Remove item from localstorage
  self.remove = function (property) {
    localStorage.removeItem(property);
  };
  // Delete everything in ls
  self.clear = function () {
    localStorage.clear();
  };

  self.shush = function (holla) {
    if (self.channel) {
      console.log('already connected to a channel');
      self.channel.disconnect();
      holla();
    } else {
      console.log('not connected to any channels yet');
      holla();
    }
  };

  self.listen = function (uid) {

    var button_size = 0,
      button_id = 0,
      element = null,
      buttons = null,
      wrapper = null;

    console.log('trying to connect to channel');

    self.channel = io.connect(self.remote_location + '/' + uid);

    self.channel.emit('get-config', uid, function (err, res) {

      console.log('got remote');

      if (err) {
        navigator.notify.alert(err);
      } else {

        console.log('emptying remote');
        $('#buttons').html('');

        if (typeof res.notify !== "undefined") {

          wrapper = $('<div class="moteio-placement"></div>')
          var notify = $('<div class="notify"></div>');

          $('#buttons').append(wrapper.append(notify));

        }

        for (button_id in res.buttons) {

          console.log('rendering remote');

          console.log('my id is ' + button_id);
          console.log('my position is ' + res.buttons[button_id].x);

          wrapper = $('<div class="moteio-placement" id="moteio-button-' + button_id + '"></div>')
            .css({
              'left': res.buttons[button_id].x,
              'top': String(res.buttons[button_id].y) + 'px',
              'position': 'absolute'
            });

          element = $('<a href="#" class="moteio-button icon-' + res.buttons[button_id].icon + '" /></a>')
            .attr('data-moteio', button_id)
              .bind('vmousedown', function (e) {
              navigator.notification.vibrate(250);
              console.log('we have a click');
              e.stopPropagation();
              var elm = $(this);
              $(this).parents('.moteio-button').addClass('moteio-down');
              self.bouncer.emit('input', {
                uuid: device.uuid,
                keypress: {
                  button: elm.attr('data-moteio'),
                  down: true
                }
              }, function () {
                navigator.notification.vibrate(100);
                setTimeout(function () {
                  navigator.notification.vibrate(100);
                }, 150);
              });
            });

          $('#buttons').append(wrapper.append(element));
        }

        $('#loading-connecting').fadeOut();
        buttons = $('.moteio-button');
        console.log('there are ' + buttons.length + 'buttons');

      }

    });

    self.channel.on('notify', function (data) {

      console.log('got notification');
      console.log(data);

      var now_playing = $('.notify');
      now_playing.empty();

      console.log(data);

      if (typeof data.image !== "undefined") {
        now_playing.append('<img src="' + data.image + '" class="thumb" />');
      }
      if (typeof data.line1 !== "undefined") {
        now_playing.append('<div class="line line-1">' + data.line1 + '</p>');
      }
      if (typeof data.line2 !== "undefined") {
        now_playing.append('<div class="line line-2">' + data.line2 + '</p>');
      }

    });

    self.channel.on('update-button', function(data){
      $('#moteio-button-' + data.id + ' > a').removeClass().addClass('moteio-button icon-' + data.icon).css({
        'color': data.color
      });
    });

  };

  self.init = function () {

    var data = null;

    if (self.get('uid')) {
      self.listen(self.get('uid'));
    }

    $('#scan').bind('vclick', function (e) {

      $('#loading-connecting').show();

      window.plugins.barcodeScanner.scan(function (result) {

        if (result.format !== "QR_CODE") {
          navigator.notification.alert('Scan the QR code on the mote.io site!');
        } else if (!result.cancelled) {

          data = {
            key: result.text,
            device: device
          };

          setTimeout(function () {
            $('#loading-connecting').fadeOut();
          }, 3000);

          self.bouncer.emit('validate-key', data, function (err, uid) {

            console.log('validate');

            if (err) {
              $('#loading-connecting').fadeOut();
              console.log(err);
              navigator.notification.alert("There was a problem. Try again!");

            } else {

              navigator.notification.vibrate(500);

              self.shush(function () {
                console.log('callback made');
                console.log('listening !!!!!!!!!!!!!!!!');
                self.listen(uid);
                self.set('uid', uid);
              });

            }

          });
        } else {
          console.log('something totally different happened');
        }

      }, function (error) {
        navigator.notify.alert("Scanning failed: " + error);
      });

    });

  };

};
