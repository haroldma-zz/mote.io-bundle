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

  self.remote_location = 'https://localhost:3000';
  //self.remote_location = 'https://mote.io';
  self.channel = null;

  self.set = function(key, data) {
    // Put the object into storage
    console.log('set ' + key + ' as')
    console.log(data)
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  }
  self.get = function(key) {
    // Retrieve the object from storage
    console.log('get ' + key)
    var retrievedObject = localStorage.getItem(key);
    if(typeof retrievedObject !== "undefined") {
      console.log(retrievedObject)
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

  self.populateHash = function (given, fallback) {
    if(typeof given !== "undefined" && given) {
      return given;
    }
    return fallback;
  }

  self.renderRemote = function(res) {

    console.log('got remote');

    console.log(res)

    var
      button_id = 0,
      wrapper = null,
      button_size = 0,
      element = null,
      buttons = null;

    if(typeof res == "undefined" || !res) {
      alert('Connected to site but window.moteio_config is not defined on web page.');
    } else if(typeof res.app_name == "undefined" || !res.app_name) {
      alert('Please supply an app name in the moteio_config.')
    }

    if(!$('#remote-render').html()) {
      $.mobile.changePage($('#remote'));
    }

    console.log('emptying remote');
    $('.ui-title').text(res.app_name);
    $('#remote-render').html('');

    console.log(res)

    var id = 0;

    for(var key in res.blocks) {

      var type = res.blocks[key].type,
      params = res.blocks[key];

      console.log(params)
      console.log(id)

      params._id = id;
      id++;

      console.log(type)
      console.log(params)

      type = params.type;

      if(type == "notify") {

        console.log('have a notify')

        wrapper = $('<div class="block"></div>');
        var notify = $('<div class="notify"></div>');

        $('#remote-render').append(wrapper.append(notify));

        console.log($('#remote-wrapper').html())

      }

      if(type == "buttons") {

        console.log('rendering remote');

        console.log(params)

        var container = $("<div class='buttons'></div>");

        var i = 0;
        $.each(params.data, function(index, button){

          var data = {
            block_id: params._id,
            _id: i,
            hash: self.populateHash(button.hash, params._id + '_' + i),
            uuid: device.uuid
          }

          var data = self.populateHash(params.hash, data);

          element = $('<span id="moteio-button-' + data.hash + '" class="moteio-button icon-' + button.icon + '" /></span>')
            .bind('vmousedown', function (e) {

              navigator.notification.vibrate(250);
              e.stopPropagation();

              data.press = true;

              self.channel.emit('input', data, function () {
              });

            })
            /*
            element.bind('vmouseup', function (e) {

              navigator.notification.vibrate(250);
              e.stopPropagation();

              data.press = false;

              self.channel.emit('input', data, function () {
              });

            });
            */

            container.append(element);
            i++;
        });

        $('#remote-render').append($('<div class="block"></div>').append(container));
      }

      if(type == "select") {

        var select_html = $('<select></select>');

        for(var option in params.data){
          var option_html = $('<option value="' + option + '" data-paramid="' + params._id + '">' + params.data[option].text + '</option>');
          if(typeof params.data[option].optgroup !== "undefined") {
            if(select_html.find('optgroup[label=' + params.data[option].optgroup + ']').html() == null){
              select_html.append('<optgroup label="' + params.data[option].optgroup + '"></optgroup>')
              select_html.find('optgroup[label=' + params.data[option].optgroup + ']').append(option_html);
            } else {
              select_html.find('optgroup[label=' + params.data[option].optgroup + ']').append(option_html);
            }
          } else {
            select_html.append(option_html);
          }
        }

        select_html.bind('change', function(e) {

          var option_data = $(this).find(":selected").data();

          var data = {
            block_id: option_data.paramid,
            _id: $(this).val(),
            hash: option_data.paramid + '_' + $(this).val(),
            uuid: device.uuid
          }

          self.channel.emit('select', data, function () {

            navigator.notification.vibrate(100);

            setTimeout(function () {
              navigator.notification.vibrate(100);
            }, 150);

          });

        });

        $('#remote-render').append($('<div class="block"></div>').append(select_html));
        $("#remote-render").trigger("create");

      }

      if(type == "search") {

        var search_html = $('<form class="block" name="search-form" id="search-form"><input type="search" name="search" id="search" value="" /></form>');


        var data = {
          block_id: params._id,
          hash: params._id,
          uuid: device.uuid
        }

        search_html.bind('submit', function(e) {


          data.query =  $("#search").val()

          self.channel.emit('search', data, function () {

            navigator.notification.vibrate(100);

            setTimeout(function () {
              navigator.notification.vibrate(100);
            }, 150);

          });

          return false;

        });

        $('#remote-render').append(search_html);
        $("#remote-render").trigger("create");

      }

    }

    $.mobile.changePage($('#remote'));

    buttons = $('.moteio-button');
    console.log('there are ' + buttons.length + 'buttons');

  };

  self.listen = function (roomName) {

    console.log('trying to connect to channel ' + roomName);

    self.channel = io.connect(self.remote_location + '/' + roomName, {'force new connection': true, 'secure': true});

    console.log(self.channel)

    self.channel.emit('get-config');

    self.channel.on('update-config', function (data) {
      self.renderRemote(data);
    });

    self.channel.on('connect_failed', function (reason) {
      alert('The server has restarted. Pleae login again. Sorry.');
      self.logout();
    });

    self.channel.on('disconnect', function() {
      alert('Connection lost!');

      self.logout();
      $.mobile.changePage($('#login'));

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
      console.log('got update button')
      console.log(data)
      if(data.icon) {
        $('#moteio-button-' + data.hash).removeClass().addClass('moteio-button icon-' + data.icon);
      }
      if(data.color) {
        $('#moteio-button-' + data.hash).css({
          'color': data.color
        });
      }
    });

    $('.go-home').click(function(){
      console.log('go home')
      self.channel.emit('go-home');
    });

  };

  self.logout = function () {
    $('#remote-render').html('');
    $.mobile.changePage($('#login'));
  }

  self.offline = function() {
  }

  self.init = function () {

    if(navigator.connection.type !== Connection.WIFI && navigator.connection.type !== Connection.ETHERNET) {
      alert('Try connecting to a Wifi network, it makes Mote.io faster!')
    }

    console.log('init fired')

    var data = null;

    $("#login-form").submit(function (e) {

      console.log('form submitted')

      e.preventDefault();

      $.mobile.changePage($('#loading'));

      var data = $(this).serializeArray();

      $.ajaxSetup({
        statusCode: {
          401: function(){
            // Redirec the to the login page.
            alert('Error authorizing.')
            $.mobile.changePage($('#login'));
          }
        }
      });

      $.ajax({
        type: 'post',
        url: self.remote_location + '/post/login',
        data: $(this).serialize(),
        dataType: 'jsonp',
        timeout: 6000,
        success: function(response) {

          console.log('got a response')
          console.log(response)

          if(response.valid) {

            console.log(response)
            console.log(data)
            if(data[2].value == "1") {
              alert('setting login!')
              self.set('login', data);
            } else {
              self.set('login', null)
            }

            self.listen(response.user._id);
            $.mobile.changePage($('#waiting'));

          } else {
            $.mobile.changePage($('#login'));
            alert(response.reason);
          }

        },
        error: function(xhr, status, err) {

          alert('There was a problem logging you in. Check your username and password.');
          $.mobile.changePage($('#login'));
        }
      });

      return false;

    });

    $('#logout').click(function(){
      self.shush();
      self.logout();
      $.mobile.changePage($('#login'));
    });

    console.log(self.get('login'))

    if(self.get('login')) {

      var data = self.get('login')

      $('#username').val(data[0].value)
      $('#password').val(data[1].value)
      $('#remember-me').val('1')
      // $("#login-form").submit();

    }

    $.mobile.changePage($('#login'));

  };

};
