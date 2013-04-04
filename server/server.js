/*jslint node: true, maxerr: 50, indent: 2 */
"use strict";

var
  path = require('path'),
  http = require('http'),
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
  MongoStore = require('connect-mongo')(express),
  config = {};

var constructDBURL = function(db) {
  var dbUrl = 'mongodb://';
  if(db.username) {
    dbUrl += db.username+':'+ db.password+'@';
  }
  dbUrl += db.host+':'+ db.port;
  dbUrl += '/' + db.db;
  return dbUrl;
}

app.configure('development', function(){

  config = {
    db: {
      db: 'test',
      port: '27017',
      host: 'localhost'
    },
    secret: '076ee61d63aa10a125ea872411e433b9',
    port: 3000
  };

  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  mongoose.connect(constructDBURL(config.db));

});

app.configure('production', function(){

  config = {
    db: {
      db: 'nodejitsu_sw1tch_nodejitsudb2423373404',
      host: 'ds051947.mongolab.com',
      port: 51947,
      username: 'nodejitsu_sw1tch',
      password: 'devo6no14em8qckhucr6fndapm',
      collection: 'sessions'
    },
    secret: '076ee61d63aa10a125ea872411e433b9',
    port: 1337
  };
  // app.use(express.errorHandler());
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

  console.log('running in prod')
  mongoose.connect(constructDBURL(config.db));
});

var sessionStore = new MongoStore(config.db);

app.configure(function() {

  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', { layout: false });

  app.use(express.logger());
  app.use(express.bodyParser());
  app.use(express.methodOverride());

  app.use(express.cookieParser());
  app.use(express.session({
    store: sessionStore,
    secret: 'keyboard cat',
    cookie: { maxAge: 60000 * 60 * 24 * 365 * 4}
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));

});

var Account = require('./models/account');

passport.use(Account.createStrategy());

passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

require('./routes')(app);

var app = app.listen(config.port);
var io = require('socket.io').listen(app);

console.log('Listening on port ' + config.port);

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

var createRoom = function(roomName) {

  console.log('creating room')

  io
    .of('/' + roomName)
    .authorization(function (handshakeData, callback) {

      console.log('room name is')

      console.log(roomName == handshakeData.user._id)

      // addittional auth to make sure we are correct user
      if(String(roomName) === String(handshakeData.user._id)) {
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
      socket.on('update-config', function(data) {
        console.log('update-config')
        socket.broadcast.emit('update-config', data);
      });
      socket.on('notify', function (data, holla) {
        // winston.info('#extension has sent out a #notification');
        socket.broadcast.emit('notify', data);
        holla();
      });
      socket.on('art', function (data, holla) {
        winston.info('#extension has sent out #art');
        socket.broadcast.emit('art', data);
        holla();
      });
      socket.on('update-button', function (data, holla) {
        // winston.info('#extension has sent out #update-button');
        socket.broadcast.emit('update-button', data);
        holla();
      });
      socket.on('go-home', function(data, holla){
        console.log('go-home')
        socket.broadcast.emit('go-home');
      });
      socket.on('input', function (data, holla) {
        winston.info('#client is emitting input');
        socket.broadcast.emit('input', data);
        holla();
      });
      socket.on('select', function (data, holla) {
        winston.info('#client is emitting select');
        socket.broadcast.emit('select', data);
        holla();
      });
      socket.on('search', function (data, holla) {
        winston.info('#client is searching for' + data.value);
        socket.broadcast.emit('search', data);
        holla();
      });
      socket.on('activate', function (data, holla) {
        winston.info('#client emits "activate"!');
        socket.broadcast.emit('deactivate');
      });
      socket.on('disconnect', function () {
        winston.info('#client has left #extension');
      });

    });

}

io.sockets.on('connection', function (socket) {

  var roomName = socket.handshake.user._id;

  console.log('socket manager')
  console.log(io.sockets.manager.namespaces['/' + roomName])
  if(typeof io.sockets.manager.namespaces['/' + roomName] == "undefined") {
      createRoom(roomName);
  }

});
