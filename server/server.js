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
  config = {},
  passport = require('passport'),
  Account = require('./models/account'),
  check = require('validator').check,
  sanitize = require('validator').sanitize;

var SendGrid = require('sendgrid').SendGrid;
var sendgrid = new SendGrid('sw1tch', '0K1:a7P68G-i95;');

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
      db: 'qet7idOn',
      host: 'mongo.onmodulus.net',
      port: 27017,
      username: 'moteio',
      password: 'honeywell',
      collection: 'sessions'
    },
    secret: '076ee61d63aa10a125ea872411e433b9',
    port: process.env.PORT
  };
  // app.use(express.errorHandler());
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

  winston.info('running in prod')
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


app.get('/', function (req, res) {
    res.render('index', { user : req.user, page: 'home' });
});

app.get('/homebase', function(req, res) {
    res.render('homebase', { user : req.user, page: 'home' });
});

app.get('/start', function(req, res) {
    res.render('start', {err: null, user: req.user, page: 'start'});
});

app.get('/developers', function(req, res){
    res.render('developers', {err: null, user: req.user, page: 'developers'});
});

app.get('/admin', function(req, res) {

    if(req.user && req.user.username == "ian@meetjennings.com") {

        Account.find({}, function (err, all_users) {
          res.render('admin', {err: null, user: req.user, page: 'admin', user_list: all_users});
        });

    } else {
        res.redirect('/');
    }
});

app.get('/admin/beta', function(req, res) {
    if(req.user.username == "ian@meetjennings.com") {

        winston.info(req.query.user)

        Account.findById(req.query.user, function(err,user){
            if(err) {
                winston.info(err)
                res.redirect('/')
            } else {
                user.beta = true;
                user.save(function(){

                    winston.info('saved')
                    winston.info(user)
                    sendgrid.send({
                      to: user.username,
                      from: 'hello@mote.io',
                      subject: 'You\'ve been granted access to the mote.io beta!',
                      html:
                      'Welcome to mote.io.' +
                      '<br/>' +
                      '<br/>' +
                      'You\'re account has been approved for beta! Get started here:' +
                      '<br/>' +
                      'http://mote.io/start' +
                      '<br/>' +
                      '<br/>' +
                      'And you can download the Android APK here:' +
                      'http://mote.io/downloads/Mote.io.apk' +
                      '<br/>' +
                      '<br/>' +
                      'Thanks for testing! Follow me on twitter for more updates about mote.io:' +
                      '<br/>' +
                      'http://twttier.com/sw1tch' +
                      '<br/>' +
                      '<br/>' +
                      '--------------------'
                    }, function(success, message) {
                      if (!success) {
                        winston.info(message);
                      }
                    });

                    res.redirect('/admin');
                })
            }
        });
    } else {
        redirect('/');
    }
});

app.get('/beta', function(req, res) {
    res.render('beta', {err: null, user: req.user, page: 'start' });
});

app.get('/register', function(req, res) {
    res.render('register', {err: null, user: req.user, page: 'start' });
});

app.post('/register', function(req, res) {
    try {
        check(req.body.username, 'Please enter a valid email address.').len(6, 64).isEmail();
        check(req.body.password, 'Please enter a password between 3 and 64 characters.').len(3, 64);
    } catch (err) {
        return res.render('register', { user : null, err: err, page: 'start' });
    }

    Account.register(new Account({ username : req.body.username, beta: false }), req.body.password, function(err, account) {

        if (err) {
            res.render('register', { user : null, err: err, page: 'start' });
        } else {
            sendgrid.send({
              to: req.body.username,
              from: 'hello@mote.io',
              subject: 'Welcome to the wonderful world of mote.io',
              html:
              'Welcome to the wonderful world of mote.io.' +
              '<br/>' +
              '<br/>' +
              'You\'re on the beta list! New accounts are provisioned daily, expect access soon.' +
              '<br/>' +
              '<br/>' +
              'Follow me on twitter for more updates about mote.io:' +
              '<br/>' +
              'http://twttier.com/sw1tch' +
              '<br/>' +
              '<br/>' +
              '--------------------'
            }, function(success, message) {
              if (!success) {
                winston.info(message);
              }
            });

            res.redirect('/beta');

        }

    });
});

app.get('/login', function(req, res) {
    if(req.user) {
        res.redirect('/start');
    } else {
        res.render('login', { page: 'start', err: null });
    }
});

app.post('/login', passport.authenticate('local'), function(req, res) {

    if(req.user) {

        if(req.user.beta) {
            createRoom(req.user._id);
            res.redirect('/start');
        } else {
            res.render('login', { page: 'start', err: 'Account has not been approved for beta yet!' });
        }

    } else {
        res.render('login', {page: 'start', err: 'Invalid login!'});
    }

});

app.get('/get/login', function(req, res) {
    if(req.user) {

        if(req.user.beta) {

            createRoom(req.user._id);
            res.jsonp({
                valid: true,
                user: {
                    username: req.user.username,
                    _id: req.user._id
                }
            });

        } else {

            res.jsonp({
                valid: false,
                reason: 'Account has not been approved for beta yet!'
            })

        }

    } else {
        res.jsonp({
            valid: false
        });
    }
});

app.get('/post/login', passport.authenticate('local'), function(req, res) {
    if(req.user) {
        if(req.user.beta) {

            createRoom(req.user._id);
            res.jsonp({
                valid: true,
                user: {
                    username: req.user.username,
                    _id: req.user._id
                }
            });

        } else{
            res.jsonp({
                valid: false,
                reason: 'Account has not been approved for beta yet!'
            })
        }
    } else {
        res.jsonp({
            valid: false,
            reason: 'Invalid login!'
        });
    }

});

app.get('/post/logout', function(req, res) {

    if(req.user) {

      console.log(io.sockets.manager.namespaces);

      req.logout();
      res.jsonp({
          valid: true,
      })
    } else {
      res.jsonp({
          valid: false,
          reason: 'Not even logged in!'
      });
    }

});

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

var app = app.listen(config.port);
var io = require('socket.io').listen(app);

winston.info('Listening on port ' + config.port);

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

io.sockets.on('connection', function (socket) {

  console.log(socket.handshake.user)

  var username = socket.handshake.user.username;

  console.log('socket manager')
  console.log(io.sockets.manager.namespaces['/' + username])
  if(typeof io.sockets.manager.namespaces['/' + username] == "undefined") {
      createRoom(username);
  }

});

var createRoom = function(roomName) {

  winston.info('creating room with name ' + roomName);

  io
    .of('/' + roomName)
    .authorization(function (handshakeData, callback) {

      var clients = io.of('/' + handshakeData.user.id).clients();
      console.log(clients)

      winston.info('room name is')

      console.log(handshakeData)

      winston.info(roomName)
      winston.info(handshakeData.user.id)

      winston.info(roomName == handshakeData.user.id)

      // addittional auth to make sure we are correct user
      if(String(roomName) === String(handshakeData.user.id)) {
        callback(null, true);
      } else {
        callback(null, false);
      }

    })
    .on('connect_failed', function (reason) {
      console.error('unable to connect to namespace', reason);
    })
    .on('connection', function (socket) {

      winston.info("user connected: ", socket.handshake.user.username);
      console.log(socket.handshake.user)
      var address = socket.handshake.address;

      winston.info('#client has connected to #extension from ' + address.address + ':' + address.port);

      // socket refers to client
      socket.on('get-config', function(data, holla){
        winston.info('got config')
        socket.broadcast.emit('get-config');
      });
      socket.on('update-config', function(data) {
        winston.info('update-config')
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
        winston.info('#extension has sent out #update-button');
        socket.broadcast.emit('update-button', data);
        holla();
      });
      socket.on('go-home', function(data, holla){
        winston.info('go-home')
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

};
