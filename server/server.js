/*jslint node: true, maxerr: 50, indent: 2 */
"use strict";
var
  io = require('socket.io').listen(8080, "0.0.0.0"),
  hat = require('hat'),
  keys = hat.rack(),
  uids = hat.rack(),
  winston = require('winston');


// channels by key is a pointer to some channel in the channels array
var channels_by_key = [],
  channels_by_uuid = [],
  channels = [],
  configs_by_uid = [];

// uuid - phones
// uid - session

io.configure(function () {
  // io.set('polling duration', 30);
  // io.set('log level', 1);
});
io
  .of('/moteio-bouncer')
  .on('connection', function (bouncer) {

    winston.info('#client connected to #bouncer');

    bouncer.on('generate-uid', function (data, holla) {

      var bouncera = bouncer.handshake.address;
      winston.info('#client has connected to #bouncer from ' + bouncera.address + ':' + bouncera.port);

      winston.info('#extension is starting a new #channel');
      var UID = uids();

      // start new channel
      channels[UID] = io
        .of('/' + UID)
        .on('connection', function (channel) {

          var address = channel.handshake.address;

          winston.info('#client has connected to #extension from ' + address.address + ':' + address.port);

          channel.on('establish-sync', function (uuid, holla) {
            winston.info('#extension has established #sync');
            channels_by_uuid[uuid] = UID;
            holla();
          });
          channel.on('notify', function (data, holla) {
            winston.info('#extension has sent out a #notification');
            channel.broadcast.emit('notify', data);
            holla();
          });
          channel.on('art', function (data, holla) {
            winston.info('#extension has sent out #art');
            channel.broadcast.emit('art', data);
            holla();
          });
          channel.on('update-button', function (data, holla) {
            winston.info('#extension has sent out #update-button');
            channel.broadcast.emit('update-button', data);
            holla();
          });
          channel.on('set-config', function (data, holla) {
            if (!configs_by_uid[data.uid]) {
              configs_by_uid[data.uid] = data.params;
              winston.info('#extension has set its #config');
              holla(null, true);
            } else {
              winston.info('#extension was unable to set #config, probably because it already exists');
              holla('Unable to set remote configuration');
            }
          });
          channel.on('get-config', function (uid, holla) {
            winston.info('#client is asking for #config');
            console.log('config is')
            console.log(configs_by_uid[uid])
            holla(null, configs_by_uid[uid]);
          });
          channel.on('disconnect', function () {
            winston.info('#client has left #extension');
          });
        });

      holla(null, UID);

    });

    bouncer.on('start-sync', function (uid, holla) {
      var key = keys();
      channels_by_key[key] = uid;
      holla(key);
    });

    bouncer.on('input', function (data, holla) {
      var channelUID = channels_by_uuid[data.uuid];
      if (typeof channelUID !== 'undefined' && typeof channels[channelUID] !== 'undefined') {
        winston.info('#client is emitting input');
        channels[channelUID].emit('input', data.keypress);
        holla();
      } else {
        winston.error('#client is emitting input, but is not authorized to send it');
        holla(null, 'unauthed');
      }
    });

    bouncer.on('validate-key', function (data, holla) {
      var channelUID = channels_by_key[data.key];
      if (typeof channelUID !== 'undefined' && typeof channels[channelUID] !== 'undefined') {
        channels[channelUID].emit('request-access', data.device);
        // the key is good, now ask the browser if we can auth
        winston.info('#bouncer says the key checks out');
        holla(null, channelUID);
      } else {
        // bad key
        winston.info('#bouncer says the key is bad');
        holla('badSyncKey');
      }
    });

    bouncer.on('disconnect', function () {
      winston.info('#client has left #bouncer');
    });

  });
