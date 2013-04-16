/*jslint node: true, maxerr: 50, indent: 2 */
"use strict";

var
  path = require('path'),
  https = require('https'),
  fs = require('fs'),
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
  sanitize = require('validator').sanitize,
  marked = require('marked');

var SendGrid = require('sendgrid').SendGrid;
var sendgrid = new SendGrid('sw1tch', '0K1:a7P68G-i95;');

var app = express();

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
    port: 3000,
    key: fs.readFileSync(__dirname + '/self.key').toString(),
    ca: fs.readFileSync(__dirname + '/self.csr').toString(),
    cert: fs.readFileSync(__dirname + '/self.crt').toString(),
    passphrase: 'honeywell'
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
    port: process.env.PORT,
    key: null,
    ca: null,
    cert: null,
    passphrase: null
  };
  app.use(express.errorHandler());
  //app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

  winston.info('running in prod')
  mongoose.connect(constructDBURL(config.db));
});

var sessionStore = new MongoStore(config.db);

app.configure(function() {

  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', { layout: false });

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

app.get('/community', function(req, res) {
    res.render('community', {err: null, user: req.user, page: 'community'});
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

app.get('/admin/email', function(req, res) {
  if(req.user && req.user.username == "ian@meetjennings.com") {
    res.render('admin-email.jade', {err: null, user: req.user, page: 'admin', user_list: false, test_email: '', blast_title: '', blast_text: ''});
  } else {
    res.redirect('/');
  }
});

app.post('/admin/email', function(req, res) {

  if(req.user && req.user.username == "ian@meetjennings.com") {

    if(req.body.forreals) {

      Account.find({}, function (err, all_users) {

        for (var i = 0; i < all_users.length; i++) {

          var email = {
            to: all_users[i].username,
            from: 'hello@mote.io',
            subject: req.body.blast_title,
            html: marked(req.body.blast_text) +
            '--------------------'
          }

          console.log(email)

          /*
          sendgrid.send(email, function(success, message) {
            if (!success) {
              winston.info('Email sent to ' + all_users[i].username);
            }
          });
          */

        }

        res.render('admin-email.jade', {
          err: null,
          user: req.user,
          page: 'admin',
          user_list: all_users,
          blast_text: '',
          blast_title: '',
          test_email: ''
        });

      });

    } else {

      if(req.body.test_email) {

        var email = {
          to: req.body.test_email,
          from: 'hello@mote.io',
          subject: req.body.blast_title,
          html: marked(req.body.blast_text) +
          '--------------------'
        }

        sendgrid.send(email, function(success, message) {
          if (!success) {
            winston.info(message);
          }
        });

        winston.info('Sending test email to ' + req.body.test_email);

      }

      res.render('admin-email.jade', {
        err: null,
        user: req.user,
        page: 'admin',
        user_list: false,
        blast_text: req.body.blast_text,
        blast_title: req.body.blast_title,
        test_email: req.body.test_email
      });

    }

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
                      'http://twitter.com/sw1tch' +
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
              'http://twitter.com/sw1tch' +
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

      // console.log(io.sockets.manager.namespaces);

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

var options = {
  key: config.key,
  ca: [config.ca],
  cert: config.cert,
  passphrase: config.passphrase
}

var server = https.createServer(options, app);
var io = require('socket.io').listen(server);

server.listen(config.port);

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

  var username = socket.handshake.user._id;

  //console.log(io.sockets.manager.namespaces['/' + username])
  if(typeof io.sockets.manager.namespaces['/' + username] == "undefined") {
      createRoom(username);
  }

});

var createRoom = function(roomName) {

  winston.info('[bouncer][create room][' + roomName + ']');

  io
    .of('/' + roomName)
    .authorization(function (handshakeData, callback) {

      winston.info('[' + handshakeData.user.username + '][authorization][' + roomName + '][try]');

      // addittional auth to make sure we are correct user
      if(String(roomName) === String(handshakeData.user.id)) {
        winston.info('[' + handshakeData.user.username + '][authorization][' + roomName + '][success]');
        callback(null, true);
      } else {
        winston.info('[' + handshakeData.user.username + '][authorization][' + roomName + '][fail]');
        callback(null, false);
      }

    })
    .on('connection', function (socket) {

      var address = socket.handshake.address;

      winston.info('[' + socket.handshake.user.username + '][connection][' + address.address + ':' + address.port + ']');

      // socket refers to client
      socket.on('get-config', function(data, holla){
        winston.info('got config')
        socket.broadcast.emit('[' + socket.handshake.user.username + '] get-config');
      });
      socket.on('update-config', function(data) {
        winston.info('[' + socket.handshake.user.username + '][update-config]')
        socket.broadcast.emit('update-config', data);
      });
      socket.on('notify', function (data, holla) {
        winston.info('[' + socket.handshake.user.username + '][notify]');
        socket.broadcast.emit('notify', data);
        holla();
      });
      socket.on('art', function (data, holla) {
        winston.info('[' + socket.handshake.user.username + '][art]');
        socket.broadcast.emit('art', data);
        holla();
      });
      socket.on('update-button', function (data, holla) {
        winston.info('[' + socket.handshake.user.username + '][update-buton]');
        socket.broadcast.emit('update-button', data);
        holla();
      });
      socket.on('go-home', function(data, holla){
        winston.info('[' + socket.handshake.user.username + '][go-home]')
        socket.broadcast.emit('go-home');
      });
      socket.on('input', function (data, holla) {
        winston.info('[' + socket.handshake.user.username + '][input]');
        socket.broadcast.emit('input', data);
        holla();
      });
      socket.on('select', function (data, holla) {
        winston.info('[' + socket.handshake.user.username + '][select]');
        socket.broadcast.emit('select', data);
        holla();
      });
      socket.on('search', function (data, holla) {
        winston.info('[' + socket.handshake.user.username + '][search][' + data.value + ']');
        socket.broadcast.emit('search', data);
        holla();
      });
      socket.on('activate', function (data, holla) {
        winston.info('[' + socket.handshake.user.username + '][activate]');
        socket.broadcast.emit('deactivate');
      });
      socket.on('disconnect', function () {
        winston.info('[' + socket.handshake.user.username + '][disconnect]');
      });

    });

};
