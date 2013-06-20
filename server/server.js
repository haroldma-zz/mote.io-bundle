/*jslint node: true, maxerr: 50, indent: 2 */
"use strict";

var
  path = require('path'),
  http = require('http'),
  https = require('https'),
  fs = require('fs'),
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
  Account = require('./models/account'),
  check = require('validator').check,
  sanitize = require('validator').sanitize,
  redis = require('socket.io/node_modules/redis'),
  marked = require('marked'),
  clog = null;

var loggly = require('loggly');
var config = {
  json: true,
  subdomain: "moteioo",
    auth: {
      username: "moteio",
      password: "CUTh&5R7B:BVe@i"
    }
  };
var client = loggly.createClient(config);

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
    redis: {
      pass: 'zAnmp7ashaltfv8CRDdJw7xx3T8xoheq0X5y9pAdO31sQeih4LphinmB3zRttWNz',
      host: 'proxy2.openredis.com',
      port: 12135
    },
    secret: '076ee61d63aa10a125ea872411e433b9',
    port: 3000,
    key: fs.readFileSync(__dirname + '/self.key').toString(),
    ca: fs.readFileSync(__dirname + '/self.csr').toString(),
    cert: fs.readFileSync(__dirname + '/self.crt').toString(),
    passphrase: 'honeywell',
    id: 1
  };

  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  mongoose.connect(constructDBURL(config.db));

  clog = function(data) {

    var usage = process.memoryUsage();

    for (var attrname in usage) { data[attrname] = usage[attrname]; }

    data.config_id = config.id;
    data.config_mode = "development";

    console.log(data);
    client.log('98f15fa9-3aa8-46d1-8df9-f451c9579b32', data);

  }

  clog({subject: "server", action: "boot"});

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
    redis: {
      pass: 'zAnmp7ashaltfv8CRDdJw7xx3T8xoheq0X5y9pAdO31sQeih4LphinmB3zRttWNz',
      host: '54.243.253.145',
      port: 12135
    },
    secret: '076ee61d63aa10a125ea872411e433b9',
    port: process.env.PORT,
    key: null,
    ca: null,
    cert: null,
    passphrase: null,
    id: process.env.SERVO_ID
  };

  app.use(express.errorHandler());
  //app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

  mongoose.connect(constructDBURL(config.db));

  clog = function(data) {

    var usage = process.memoryUsage();

    for (var attrname in usage) { data[attrname] = usage[attrname]; }

    data.config_id = config.id;
    data.config_mode = "production";

    client.log('8b6aee86-0628-4277-8786-87a057aa191d', data)
  }

  clog({subject: "server", action: "boot"});

});

process.on('uncaughtException', function(err) {
  err.source = "uncaughtException";
  clog(err);
});

var db = mongoose.connection;
db.on('error', function(err){
  err.source = 'mongoose';
  clog(err);
});
db.once('open', function callback () {
  clog({subject: 'mongo', message: 'connection-success'})
});

var pub = redis.createClient(config.redis.port, config.redis.host);
var sub = redis.createClient(config.redis.port, config.redis.host);
var store = redis.createClient(config.redis.port, config.redis.host);
pub.on('error', function(err){
  err.source = 'redis-pub';
  clog(err);
});
sub.on('error', function(err){
  err.source = 'redis-sub';
  clog(err);
});
store.on('error', function(err){
  err.source = 'redis-store';
  clog(err);
});
pub.auth(config.redis.pass, function(err){
  if(err){
    err.source = 'redis-pub';
    clog(err);
  }
  clog({subject: 'redis-pub', 'message': 'auth-success'});
});
sub.auth(config.redis.pass, function(err){
  if(err){
    err.source = 'redis-sub';
    clog(err);
  }
  clog({subject: 'redis-sub', 'message': 'auth-success'});
});
store.auth(config.redis.pass, function(err){
  if(err){
    err.source = 'redis-store';
    clog(err);
  }
  clog({subject: 'redis-store', 'message': 'auth-success'});
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
    secret: 'N+&%B/.E<b&J95l',
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
    res.render('start', {user: req.user, page: 'start'});
});

app.get('/community', function(req, res) {
    res.render('community', {user: req.user, page: 'community'});
});

app.get('/developers', function(req, res){
    res.render('developers', {user: req.user, page: 'developers'});
});

app.get('/admin', function(req, res) {
  if(req.user && req.user.username == "ian@meetjennings.com") {
    Account.find({}, function (err, all_users) {
      res.render('admin', {user: req.user, page: 'admin', user_list: all_users});
    });
  } else {
    res.redirect('/');
  }
});

app.get('/admin/email', function(req, res) {
  if(req.user && req.user.username == "ian@meetjennings.com") {
    res.render('admin-email.jade', {user: req.user, page: 'admin', user_list: false, test_email: '', blast_title: '', blast_text: ''});
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

          sendgrid.send(email, function(success, message) {
            if (!success) {
              clog({subject: 'email', action: 'sent', user: all_users[i].username});
            }
          });

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
            clog({subject: 'email', action: 'error', error: message});
          }
        });

        clog({subject: 'email', action: 'testSend', address: req.body.test_email});

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

        clog(req.query.user)

        Account.findById(req.query.user, function(err,user){
            if(err) {
                clog(err)
                res.redirect('/')
            } else {
                user.beta = true;
                user.save(function(){

                    clog({subject: 'user', action: 'grantedAccess', user: user});
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
                        message.source = "enableBeta";
                        clog(message);
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
    res.render('beta', {user: req.user, page: 'start' });
});

app.get('/register', function(req, res) {
    res.render('register', {user: req.user, page: 'start' });
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
                message.source = 'register';
                clog(message);
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
        res.render('login', { page: 'start'});
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

app.get('/reset', function(req, res) {
  res.render('reset', { page: 'start'});
});

app.post('/reset', function(req, res) {

  if(req.body.email) {

    Account.findOne({username: req.body.email}, function (err, the_user) {

      if (err) {
        res.render('reset', { page: 'start', err: err });
      } else {

        if(the_user) {

          var ts = new Date().getTime();
          the_user.reset_expires = ts + (60 * 60 * 24 * 1000);
          the_user.reset = require('crypto').randomBytes(32).toString('hex');
          the_user.save(function (err) {

            sendgrid.send({
              to: the_user.username,
              from: 'hello@mote.io',
              subject: 'Mote.io Password Reset',
              html:
                'Forgot your password?' +
                '<br/>' +
                '<br/>' +
                'Click here to reset your password:' +
                '<br/>' +
                'http://mote.io/reset/confirm/?username=' + the_user.username + '&key=' + the_user.reset +
                '<br/>' +
                '--------------------'
            }, function(success, message) {
              if (!success) {
                res.render('reset', { page: 'start', err: 'Failed sending email.' });
              } else {
                res.render('reset', { page: 'start', alert: 'Reset email sent!' });
              }
            });

          });

        } else {
          res.render('reset', { page: 'start', err: 'User does not exist.' });
        }

      }

    });

  }

});

app.get('/reset/confirm', function(req, res) {

  Account.findOne({username: req.query.username, reset: req.query.key}, function (err, the_user) {

    if(err) {
      res.render('reset', { page: 'start', err: 'Error looking for user.' });
    } else {

      if(the_user) {
        if(new Date().getTime() > the_user.reset_expires) {
          res.render('reset', { page: 'start', err: 'Token has expired. Please try again.' });
        } else {
          res.render('confirm_password', {page: 'start', email: the_user.username, key: req.query.key, username: req.query.username});
        }
      } else {
        res.render('reset', { page: 'start', err: 'Can not find user with that email or invalid key.' });
      }

    }

  });

});

app.post('/reset/confirm', function(req, res) {

  Account.findOne({username: req.body.username, reset: req.body.key}, function (err, the_user) {

    if(err) {
      res.render('reset', { page: 'start', err: 'Can not find user with that email or invalid key.' });
    } else {

      if(the_user) {

        if(new Date().getTime() > the_user.reset_expires) {
          res.render('reset', { page: 'start', err: 'Token has expired. Please try again.' });
        } else {
          the_user.setPassword(req.body.password, function(err) {
            the_user.reset = null;
            the_user.reset_expires = null;
            the_user.save(function (err) {
              if(err) {
                res.render('reset', { page: 'start', err: 'Problem resetting password' });
              } else {
                res.render('login', { page: 'start', alert: 'Password reset!' });
              }
            });
          });
        }

      } else {
        res.render('reset', { page: 'start', err: 'Can not find user with that email or invalid key.' });
      }

    }

  });

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

if(process.env.NODE_ENV == "production") {

  var server = http.createServer(app);
  var io = require('socket.io').listen(server);
  server.listen(config.port);

} else {

  var options = {
    key: config.key,
    ca: [config.ca],
    cert: config.cert,
    passphrase: config.passphrase
  }

  var server = https.createServer(options, app);
  var io = require('socket.io').listen(server);
  server.listen(config.port);
}

io.configure(function () {

  // io.set('polling duration', 30);
  // io.set('log level', 1);

  io.set("authorization", passportSocketIo.authorize({
    key:    'connect.sid',       //the cookie where express (or connect) stores its session id.
    secret: 'N+&%B/.E<b&J95l', //the session secret to parse the cookie
    store:   sessionStore,     //the session store that express uses
    fail: function(data, accept) {     // *optional* callbacks on success or fail
      console.log('failure')
      console.log(data)
      accept(null, false);             // second param takes boolean on whether or not to allow handshake
    },
    success: function(data, accept) {
      accept(null, true);
    }
  }));

  io.set('transports', [
      'websocket'
    , 'flashsocket'
    , 'htmlfile'
    , 'xhr-polling'
    , 'jsonp-polling'
  ]);

  var RedisStore = require('socket.io/lib/stores/redis');
  io.set('store', new RedisStore({
    redis: redis,
    redisPub: pub,
    redisSub: sub,
    redisClient: store
  }));

});

io.sockets.on('connection', function (socket) {

  var username = socket.handshake.user._id;

  clog({subject: 'user', action: 'connection', username: username});

  //console.log(io.sockets.manager.namespaces['/' + username])
  if(typeof io.sockets.manager.namespaces['/' + username] == "undefined") {
    createRoom(username);
  }

});

var createRoom = function(roomName) {

  clog({subject: 'bouncer', action: 'createRoom', room: roomName});

  io
    .of('/' + roomName)
    .authorization(function (handshakeData, callback) {

      clog({subject: 'user', action: 'authorization', room: roomName, username: handshakeData.user.username});

      // addittional auth to make sure we are correct user
      if(String(roomName) === String(handshakeData.user._id)) {
        clog({success: true, subject: 'user', action: 'authorization', room: roomName, username: handshakeData.user.username});
        callback(null, true);
      } else {
        clog({success: false, subject: 'user', action: 'authorization', room: roomName, username: handshakeData.user.username});
        callback(null, false);
      }

    })
    .on('connection', function (socket) {

      var address = socket.handshake.address;

      clog({subject: 'user', username: socket.handshake.user.username, action: 'connection', address: address.address, port: address.port});
      socket.broadcast.emit('new-connection');

      // socket refers to client
      socket.on('get-config', function(data, holla){
        clog({subject: 'user', username: socket.handshake.user.username, action: 'get-config'});
        socket.broadcast.emit('get-config');
      });
      socket.on('update-config', function(data) {
        clog({subject: 'user', username: socket.handshake.user.username, action: 'update-config'});
        clog('[sending out config]')
        socket.broadcast.emit('update-config', data);
      });
      socket.on('notify', function (data, holla) {
        clog({subject: 'user', username: socket.handshake.user.username, action: 'notify'});
        socket.broadcast.emit('notify', data);
        holla();
      });
      socket.on('art', function (data, holla) {
        clog({subject: 'user', username: socket.handshake.user.username, action: 'art'});
        socket.broadcast.emit('art', data);
        holla();
      });
      socket.on('update-button', function (data, holla) {
        clog({subject: 'user', username: socket.handshake.user.username, action: 'update-button'});
        socket.broadcast.emit('update-button', data);
        holla();
      });
      socket.on('go-home', function(data, holla){
        clog({subject: 'user', username: socket.handshake.user.username, action: 'go-home'});
        socket.broadcast.emit('go-home');
      });
      socket.on('input', function (data, holla) {
        clog({subject: 'user', username: socket.handshake.user.username, action: 'input'});
        console.log('got input')
        console.log(data)
        socket.broadcast.emit('input', data);
        holla();
      });
      socket.on('select', function (data, holla) {
        clog({subject: 'user', username: socket.handshake.user.username, action: 'select'});
        socket.broadcast.emit('select', data);
        holla();
      });
      socket.on('search', function (data, holla) {
        clog({subject: 'user', username: socket.handshake.user.username, action: 'search'});
        socket.broadcast.emit('search', data);
        holla();
      });
      socket.on('activate', function (data, holla) {
        clog({subject: 'user', username: socket.handshake.user.username, action: 'activate'});
        socket.broadcast.emit('deactivate');
      });
      socket.on('disconnect', function () {
        clog({subject: 'user', username: socket.handshake.user.username, action: 'disconnect'});
      });

    });

};
