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

  self.remote_location = 'http://lvh.me:3000';
  // prod self.remote_location = 'http://mote.io:80';
  self.channel = null;

  self.set = function(key, data) {
    // Put the object into storage
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  }
  self.get = function(key) {
    // Retrieve the object from storage
    var retrievedObject = localStorage.getItem(key);
    if(typeof retrievedObject !== "undefined") {
      return JSON.parse(retrievedObject);
    } else {
      return false;
    }
  }

  self.shush = function () {
    if (self.channel) {
      console.log('already connected to a channel');
      self.channel.disconnect();
    } else {
      console.log('not connected to any channels yet');
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
    $('#remote-render').html('');

    console.log(res)

    var id = 0;
    $.each(res.blocks, function(type, params) {

      params._id = id;
      id++;

      console.log(type)
      console.log(params)

      type = params.type;

      if(type == "notify") {

        wrapper = $('<div class="moteio-placement"></div>').css({
            left: params.x + 'px',
            top: params.y + 'px'
          });
        var notify = $('<div class="notify"></div>');

        $('#remote-wrapper').append(wrapper.append(notify));

      }

      if(type == "buttons") {

        console.log('rendering remote');

        console.log(params)

        var container = $("<div class='buttons'></div>");

        var i = 0;
        $.each(params.data, function(index, button){

          console.log(index)
          console.log(button)

          var button = button;

          var data = {
            block_id: params._id,
            _id: i,
            hash: params._id + ':' + i,
          }

          element = $('<a href="#" id="moteio-button-' + index + '" class="moteio-button icon-' + button.icon + '" /></a>')
            .data('data', button)
            .bind('tap', function (e) {
              navigator.notification.vibrate(250);
              e.stopPropagation();

              data.press = true;

              self.channel.emit('input', data, function () {
                navigator.notification.vibrate(100);
                setTimeout(function () {
                  navigator.notification.vibrate(100);
                }, 150);
              });

            });

            container.append(element);
            i++;
        });

        $('#remote-render').append(container);
      }

      if(type == "select") {

        var select_html = $('<select name="select-' + i + '" id="select-' + i + '"></select>');

        for(var option in params[i].options){
          var option_html = $('<option value="' + option + '">' + params[i].options[option].text + '</option>');
          select_html.append(option_html);
        }

        select_html.bind('change', function(e) {

          self.channel.emit('select', {
            id: 0,
            value: $(this).val()
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

      if(type == "search") {

        var search_html = $('<form name="search-form" id="search-form"><input type="search" name="search" id="search" value="" /></form>');

        search_html.bind('submit', function(e) {

          self.channel.emit('search', {
            id: 0,
            value: $("#search").val()
          }, function () {

            navigator.notification.vibrate(100);

            setTimeout(function () {
              navigator.notification.vibrate(100);
            }, 150);

          });

          return false;

        });

        $('#form').append(search_html);
        $("#form").trigger("create");

      }

    });

    // fade loading out
    $('#loading-connecting').fadeOut();
    buttons = $('.moteio-button');
    console.log('there are ' + buttons.length + 'buttons');


  };

  self.listen = function (roomName) {

    console.log('trying to connect to channel ' + roomName);

    self.channel = io.connect(self.remote_location + '/' + roomName);

    self.channel.emit('get-config');

    self.channel.on('update-config', function (data) {
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

    $('#go-home').click(function(){
      console.log('go home')
      self.channel.emit('go-home');
    });

  };

  self.logout = function () {
    self.set('login', null);
    self.shush();
  }

  self.init = function () {

    var data = null;

    $("#login-form").submit(function () {

      $.mobile.changePage($('#loading'));

      var data = $(this).serializeArray();

      $.ajax({
        type: 'get',
        url: self.remote_location + '/post/login',
        data: $(this).serialize(),
        dataType: 'jsonp',
        success: function(response) {

          if(response.valid) {

            console.log(response)
            if(data[2].value == "1") {
              self.set('login', data);
            }

            self.listen(response.user._id);
            $.mobile.changePage($('#remote'));

          } else {
            $.mobile.changePage($('#login'));
            alert('Incorrect')
          }

        },
        error: function(xhr, status, err) {
          if (xhr.status == 401) {
            alert('Incorrect')
          } else {
            alert('There was a problem, please try again.')
          }
          $.mobile.changePage($('#login'));
        }
      });

      return false;

    });

    $('#logout').click(function(){
      self.logout();
      $.mobile.changePage($('#login'));
    })

    if(self.get('login')) {

      var data = self.get('login')

      $('#username').val(data[0].value)
      $('#password').val(data[1].value)
      $("#login-form").submit();

    }

  };

};
