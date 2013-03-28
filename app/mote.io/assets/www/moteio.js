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

  self.renderRemote = function(res) {

    console.log('got remote');

    console.log(res)

    var
      button_id = 0,
      wrapper = null,
      button_size = 0,
      element = null,
      buttons = null;


    console.log('emptying remote');
    $('#buttons').html('');

    // render notify div
    if (res.notify && typeof res.notify !== "undefined") {

      wrapper = $('<div class="moteio-placement"></div>').css({
          left: res.notify.x + 'px',
          top: res.notify.y + 'px'
        });
      var notify = $('<div class="notify"></div>');

      $('#buttons').append(wrapper.append(notify));

    }

    // render buttons
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
          self.channel.emit('input', {
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

    // render selects
    console.log(res.selects)
    if(typeof res.selects !== "undefined" && res.selects && res.selects.length > 0) {

      for (var i = 0; i < res.selects.length; i++) {

        var select_html = $('<select name="select-' + i + '" id="select-' + i + '"></select>');

        for(var option in res.selects[i].options){
          var option_html = $('<option value="' + option + '">' + res.selects[i].options[option].text + '</option>');
          select_html.append(option_html);
        }

        select_html.bind('change', function(e) {

          var v = $(this);
          alert($(this).val());

          self.bouncer.emit('select', {
            uuid: device.uuid,
            info: {
              value: $(this).val()
            }
          }, function () {

            navigator.notification.vibrate(100);

            setTimeout(function () {
              navigator.notification.vibrate(100);
            }, 150);

          });

        });

        $('#form').append(select_html);
        $("#form").trigger("create");

      }

    }

    // fade loading out
    $('#loading-connecting').fadeOut();
    buttons = $('.moteio-button');
    console.log('there are ' + buttons.length + 'buttons');


  };

  self.listen = function (username) {

    console.log('trying to connect to channel');

    self.channel = io.connect(self.remote_location + '/' + username);

    self.channel.emit('phone-wants-config');

    self.channel.on('phone-update-config', function (data) {
      self.renderRemote(data);
    });

    self.channel.on('notify', function (data) {

      console.log('got notification');
      console.log(data);

      var now_playing = $('.notify');
      now_playing.empty();

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
      if(data.icon) {
        $('#moteio-button-' + data.id + ' > a').removeClass().addClass('moteio-button icon-' + data.icon);
      }
      if(data.color) {
        $('#moteio-button-' + data.id + ' > a').css({
          'color': data.color
        });
      }
    });

  };

  self.init = function () {

    var data = null;

    $("#login-form").submit( function () {
      console.log($("#login-form").serialize())
      $.ajax({
        type: 'post',
        url: 'http://lvh.me:3000/login',
        data: $(this).serialize(),
        success: function(data) {
          console.log(data)
          if(data.valid) {
            $.mobile.changePage($('#remote'));
            console.log(data.user.username)
            self.listen(data.user.username);
          } else {
            alert('Incorrect')
          }
        }
      });
      return false;
    });

  };

};
