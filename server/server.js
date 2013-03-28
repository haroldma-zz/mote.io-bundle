/*jslint node: true, maxerr: 50, indent: 2 */
"use strict";

var
  path = require('path'),
  http = require('http'),
  io = require('socket.io').listen(8080, "0.0.0.0"),
  winston = require('winston'),
  express = require('express'),
  app = express(),
  passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  jade = require('jade'),
  passportSocketIo = require("passport.socketio"),
  passportLocalMongoose = require('passport-local-mongoose'),
  MongoStore = require('connect-mongo')(express);

var sessionStore = new MongoStore({
  db: 'test'
});

app.configure(function() {

  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', { layout: false });

  app.use(express.logger());
  app.use(express.bodyParser());
  app.use(express.methodOverride());

  app.use(express.cookieParser('your secret here'));
  app.use(express.session({ secret: 'keyboard cat', store: sessionStore}));

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

// Connect mongoose
mongoose.connect('mongodb://localhost/test');

require('./routes')(app);

app.listen(3000);
console.log('Listening on port 3000');

// uuid - phones
// uid - session
io.configure(function () {

  // io.set('polling duration', 30);
  io.set('log level', 1);

  io.set("authorization", passportSocketIo.authorize({
    key:    'connect.sid',       //the cookie where express (or connect) stores its session id.
    secret: 'keyboard cat', //the session secret to parse the cookie
    store:   sessionStore,     //the session store that express uses
    fail: function(data, accept) {     // *optional* callbacks on success or fail
      accept(null, false);             // second param takes boolean on whether or not to allow handshake
    },
    success: function(data, accept) {
      accept(null, true);
    }
  }));

});

var createRoom = function(username) {

  console.log('creating room')

  io
    .of('/' + username)
    .authorization(function (handshakeData, callback) {

      console.log('username is')
      console.log(username)

      // addittional auth to make sure we are correct user
      if(username == handshakeData.user.username) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    })
    .on('connection', function (socket) {

      console.log("user connected: ", socket.handshake.user.username);
      var address = socket.handshake.address;

      winston.info('#client has connected to #extension from ' + address.address + ':' + address.port);

      // socket refers to client
      socket.on('get-config', function(data, holla){
        console.log('got this')
        socket.broadcast.emit('get-config');
      });
      socket.on('go-home', function(data, holla){
        console.log('go-home')
        socket.broadcast.emit('go-home');
      });
      socket.on('update-config', function(data) {
        console.log('update-config')
        socket.broadcast.emit('update-config', data);
      });
      socket.on('notify', function (data, holla) {
        winston.info('#extension has sent out a #notification');
        socket.broadcast.emit('notify', data);
        holla();
      });
      socket.on('art', function (data, holla) {
        winston.info('#extension has sent out #art');
        socket.broadcast.emit('art', data);
        holla();
      });
      socket.on('update-button', function (data, holla) {
        winston.info('#extension has sent out #update-button');
        socket.broadcast.emit('update-button', data);
        holla();
      });
      socket.on('input', function (data, holla) {
        winston.info('#client is emitting input');
        socket.broadcast.emit('input', data.keypress);
        holla();
      });
      socket.on('disconnect', function () {
        winston.info('#client has left #extension');
      });

    });

}

io.sockets.on('connection', function (socket) {

  console.log(socket.handshake.user)

  var username = socket.handshake.user.username;

  console.log('socket manager')
  console.log(io.sockets.manager.namespaces['/' + username])
  if(typeof io.sockets.manager.namespaces['/' + username] == "undefined") {
      createRoom(username);
  }

});
