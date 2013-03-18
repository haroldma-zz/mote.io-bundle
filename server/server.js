/*jslint node: true, maxerr: 50, indent: 2 */
"use strict";

var
  path = require('path'),
  http = require('http'),
  mongoose = require('mongoose'),
  io = require('socket.io').listen(8080, "0.0.0.0"),
  winston = require('winston'),
  express = require('express'),
  app = express(),
  passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  jade = require('jade'),
  passportLocalMongoose = require('passport-local-mongoose');

app.configure(function() {

  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', { layout: false });

  app.use(express.logger());
  app.use(express.bodyParser());
  app.use(express.methodOverride());

  app.use(express.cookieParser('your secret here'));
  app.use(express.session());

  app.use(passport.initialize());
  app.use(passport.session());

  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));

});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

var Account = require('./models/account');

passport.use(Account.createStrategy());

passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

mongoose.connect('mongodb://localhost/test');

require('./routes')(app);

// Connect mongoose
app.listen(5000);
console.log('Listening on port 5000');

// channels by key is a pointer to some channel in the channels array
var configs_by_uid = [];

// uuid - phones
// uid - session
io.configure(function () {
  // io.set('polling duration', 30);
  io.set('log level', 1);
});

io
  .of('/')
  .on('connection', function (channel) {

    var address = channel.handshake.address;

    winston.info('#client has connected to #extension from ' + address.address + ':' + address.port + ' and UID ' + UID);

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
      configs_by_uid[data.uid] = data.params;
      winston.info('#extension has set its #config');
      console.log(data.params);
      channel.broadcast.emit('update-config', true);
      holla(null, true);
    });
    channel.on('get-config', function (uid, holla) {
      winston.info('#client is asking for #config');
      holla(null, configs_by_uid[uid]);
    });
    channel.on('input', function (data, holla) {
      winston.info('#client is emitting input');
      channels[channelUID].emit('input', data.keypress);
      holla();
    });
    channel.on('disconnect', function () {
      winston.info('#client has left #extension');
    });
  });
