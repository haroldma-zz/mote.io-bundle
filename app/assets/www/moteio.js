

    var App = function(){

      var self = this;

      self.remote_location = 'http://lvh.me:8080';
      self.bouncer = io.connect(self.remote_location + '/moteio-bouncer');
      self.channel = null;

      self.shush = function(holla) {
        if(self.channel){
          console.log('already connected to a channel')
          self.channel.disconnect();
          holla();
        } else {
          console.log('not connected to any channels yet')
          holla();
        }
      }

      self.listen = function(uid) {

        var button_size = 0;

        console.log('trying to connect to channel');

        self.channel = io.connect(self.remote_location + '/' + uid);

        self.channel.emit('get-config', uid, function(err, res){

          console.log('got remote');

          if(err){
            navigator.notify.alert(err);
          } else {

            console.log('emptying remote')
            $('#buttons').html('');

            if(typeof res.notify !== "undefined") {

              var notify =
                $('<div></div>')
                .attr('id', "now-playing");

              $('#buttons').append(notify);

            }

            for(var button_id in res.buttons) {

              console.log('rendering remote')

              console.log('my id is ' + button_id);
              console.log('my position is ' + res.buttons[button_id].xpos);

              var element =
                $('<a href="#" class="moteio-button"><div class="icon" style="background-image: url(\'images/icons/' + button_id + '.png\')" /></a>')
                .attr('data-moteio', button_id)
                .css({
                  'left': res.buttons[button_id].xpos,
                  'top': String(res.buttons[button_id].ypos) + 'px',
                  'position': 'absolute',
                  'display': 'block',
                });
              element.bind('vmousedown', function(e) {
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
                  }, function(){
                    navigator.notification.vibrate(100);
                    setTimeout(function(){
                      navigator.notification.vibrate(100);
                    }, 150);
                  });
                })

              $('#buttons').append(element)
            }

            $('#loading-connecting').fadeOut();
            var buttons = $('.moteio-button');
            console.log('there are ' + buttons.length + 'buttons')

          }

        });

        self.channel.on('notify', function (data) {

          console.log('got notification')
          console.log(data)

          var now_playing = $('#now-playing');
          now_playing.removeClass('with-image').empty();

          if(typeof data.image !== "undefined") {
            now_playing.addClass('with-image');
            now_playing.append('<img src="' + data.image + '" />')
          }
          if(typeof data.line1 !== "undefined") {
            now_playing.append('<p>' + data.line1 + '</p>')
          }
          if(typeof data.line2 !== "undefined") {
            now_playing.append('<p>' + data.line2 + '</p>')
          }

        });

      };

      self.init = function(){

        $('#scan').bind('vclick', function(e) {

          $('#loading-connecting').show();

          window.plugins.barcodeScanner.scan( function(result) {

              console.log('found a barcode, but were not doing anything');
              console.log()

                if(result.format !== "QR_CODE") {
                  navigator.notification.alert('Scan the QR code on the mote.io site!');
                } else if (!result.cancelled) {

                  data = {
                    key: result.text,
                    device: device
                  }

                  setTimeout(function(){
                    $('#loading-connecting').fadeOut();
                  }, 3000);

                  self.bouncer.emit('validate-key', data, function(err, uid){

                    console.log('validate')

                    if(err) {
                      $('#loading-connecting').fadeOut();
                      console.log(err);
                      navigator.notification.alert("There was a problem. Try again!");

                    } else {

                      navigator.notification.vibrate(500);

                      self.shush(function(){
                        console.log('callback made');
                        console.log('listening !!!!!!!!!!!!!!!!');
                        self.listen(uid);
                      });

                    }

                  });
                } else {
                  console.log('something totally different happened');
                }

              }, function(error) {
                alert("Scanning failed: " + error);
              }
          );

        });

      }

    }
