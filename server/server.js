  /*jslint node: true, maxerr: 50, indent: 2 */
"use strict";

require('nodefly').profile(
    '8cd1e6b02b449a3cb474a4265cb368e5', 'mote.io');

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
  Server = require('./models/server'),
  check = require('validator').check,
  sanitize = require('validator').sanitize,
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

var mongo_options = {
  server: {
    socketOptions: { keepAlive: 1 }
  },
  replset: {
    socketOptions: { keepAlive: 1 }
  }
}

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
    passphrase: 'honeywell',
    id: 1
  };

  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  mongoose.connect(constructDBURL(config.db), mongo_options);

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

  mongoose.connect(constructDBURL(config.db), mongo_options);

  clog = function(data) {

    var usage = process.memoryUsage();

    for (var attrname in usage) { data[attrname] = usage[attrname]; }

    data.config_id = config.id;
    data.config_mode = "production";

    client.log('8b6aee86-0628-4277-8786-87a057aa191d', data)
  }

  clog({subject: "server", action: "boot"});

});

var db = mongoose.connection;
db.on('error', function(err){
  err.source = 'mongoose';
  err.type = 'error';
  clog(err);
});
db.once('open', function callback () {
  clog({subject: 'mongo', message: 'connection-success'})
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

app.post('/webhook', function(req, res) {

  console.log(req.body.type);
  console.log(req.body.project)

  for(var key in req.body.project.envVars) {

    if(req.body.project.envVars[key].name == "WEBHOOK_PASSWORD" && req.body.project.envVars[key].value == "=2,_&5%#8]{@>oW") {

      console.log('WEBHOOK AUTHED!!!!!!')
      Server.find().remove()

      for(var i in req.body.project.pus) {

        var server = new Server(req.body.project.pus[i]);
        server.save(function (err) {
          if (err) return clog(err);
          clog({action: 'server-updated'});
        });

      }

    }
  }

  res.json(req.body);

});

app.get('/admin/servers', function(req, res) {

  if(req.user && req.user.username == "ian@meetjennings.com") {

    Server.find({}, function (err, all_servers) {

      res.render('admin-servers.jade', {
        err: null,
        user: req.user,
        page: 'admin',
        server_list: all_servers
      });

    });

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
                err.type = 'error';
                err.source = 'admin-login';
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
                      'The beta is over! Get started with Mote.io here:' +
                      '<br/>' +
                      'http://mote.io/start' +
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

    Account.register(new Account({ username : req.body.username, beta: true, random: Math.floor((Math.random()*100)+1) }), req.body.password, function(err, account) {

        if (err) {
            res.render('register', { user : null, err: err, page: 'start' });
        } else {

            clog({
              subject: 'user',
              action: 'register',
              success: true,
              username: req.body.username
            });

            sendgrid.send({
              to: req.body.username,
              from: 'hello@mote.io',
              subject: 'Welcome to the wonderful world of mote.io',
              html:
              'Welcome to the wonderful world of mote.io.' +
              '<br/>' +
              '<br/>' +
              'You\'re account is all set up and ready to go!' +
              '<br/>' +
              '<br/>' +
              'Click this link to get started with Mote.io:' +
              '<br/>' +
              '<a href="https://mote.io/start">https://mote.io/start</a>' +
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

            res.redirect('/start');

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

// convert userid to server
var bouncer = function(user, holla) {

  var
    random = user.random || 0,
    firstDigit = (random + "").charAt(0),
    value = null;

  if (!firstDigit) {
    firstDigit++;
  }

  Server.find({}, function (err, all_servers) {

    console.log(all_servers)
    console.log(firstDigit)

    value = Math.ceil(firstDigit / all_servers.length);

    console.log(value)
    holla(all_servers[value]);

  });

}

app.get('/get/login', function(req, res) {

    if(req.user) {

        if(req.user.beta) {

            clog({
              subject: 'user',
              action: 'getgetlogin',
              success: true,
              username: req.user.username
            });

            bouncer(req.user, function(server) {

              res.jsonp({
                  valid: true,
                  user: {
                      username: req.user.username,
                      _id: req.user._id,
                      server_id: server.id
                  }
              });

            });

        } else {

          return res.jsonp({
              valid: false,
              reason: 'Account has not been approved for beta yet!'
          })

        }

    } else {

        clog({
          subject: 'user',
          action: 'getgetlogin',
          success: false
        });

        return res.jsonp({
            valid: false
        });
    }

});

app.get('/post/login', function(req, res, next) {

    passport.authenticate('local', function(err, user, info) {

      if (err) {

        console.log(err);

        return res.jsonp({
          valid: false,
          reason: err
        });

        clog({
          subject: 'user',
          action: 'getpostlogin',
          success: false,
          reason: err
        });

      }

      if (!user) {

        console.log(info)

        clog({
          subject: 'user',
          action: 'getpostlogin',
          success: false,
          reason: info.message
        });

        return res.jsonp({
          valid: false,
          reason: info.message
        });

      }

      req.logIn(user, function(err) {

        if (err) {
          console.log(err);

          clog({
            username: user.username,
            subject: 'user',
            action: 'getpostlogin',
            success: false,
            reason: err
          });

          return res.jsonp({
            valid: false,
            reason: err
          });
        }

        if(user.beta) {

          bouncer(user, function(server) {

            res.jsonp({
              valid: true,
              user: {
                  username: user.username,
                  _id: user._id,
                  server_id: server.id
              }
            });

            clog({
              username: user.username,
              subject: 'user',
              action: 'getpostlogin',
              success: true
            });

          });

        } else{

          res.jsonp({
              valid: false,
              reason: 'Account has not been approved for beta yet!'
          });

        }

      });

    })(req, res, next);

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
      console.log('new connection authorized')
      accept(null, true);
    }
  }));

});

io.sockets.on('connection', function (socket) {

  var username = socket.handshake.user.username || null,
    userid = socket.handshake.user._id || null,
    address = socket.handshake.address || null;

  console.log('clients in room')
  console.log(io.sockets.clients(userid));

  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!' + username)
  console.log(socket.handshake);

  clog({subject: 'user', action: 'connection', username: username, userid: userid});

  if(username){

   clog({success: true, subject: 'user', action: 'authorization', username: username});

   clog({subject: 'user', username: username, userid: userid, action: 'connection', address: address.address, port: address.port});

   socket.join(userid);
   console.log('room name is')
   console.log(userid)

   socket.broadcast.to(userid).emit('new-connection');

   // socket refers to client
   socket.on('get-config', function(data, holla){
     clog({subject: 'user', username: username, userid: userid, action: 'get-config'});
     socket.broadcast.to(userid).emit('get-config');
   });
   socket.on('got-config', function(data, holla){
     clog({subject: 'user', username: username, userid: userid, action: 'got-config'});
     socket.broadcast.to(userid).emit('got-config');
   });
   socket.on('update-config', function(data) {
     clog({subject: 'user', username: username, userid: userid, action: 'update-config'});
     clog('[sending out config]')
     socket.broadcast.to(userid).emit('update-config', data);
   });
   socket.on('notify', function (data, holla) {
     clog({subject: 'user', username: username, userid: userid, action: 'notify'});
     socket.broadcast.to(userid).emit('notify', data);
     holla();
   });
   socket.on('art', function (data, holla) {
     clog({subject: 'user', username: username, userid: userid, action: 'art'});
     socket.broadcast.to(userid).emit('art', data);
     holla();
   });
   socket.on('update-button', function (data, holla) {
     clog({subject: 'user', username: username, userid: userid, action: 'update-button'});
     socket.broadcast.to(userid).emit('update-button', data);
     holla();
   });
   socket.on('go-home', function(data, holla){
     clog({subject: 'user', username: username, userid: userid, action: 'go-home'});
     socket.broadcast.to(userid).emit('go-home');
   });
   socket.on('input', function (data, holla) {
     clog({subject: 'user', username: username, userid: userid, action: 'input'});
     console.log('got input')
     console.log(data)
     socket.broadcast.to(userid).emit('input', data);
     holla();
   });
   socket.on('select', function (data, holla) {
     clog({subject: 'user', username: username, userid: userid, action: 'select'});
     socket.broadcast.to(userid).emit('select', data);
     holla();
   });
   socket.on('search', function (data, holla) {
     clog({subject: 'user', username: username, userid: userid, action: 'search'});
     socket.broadcast.to(userid).emit('search', data);
     holla();
   });
   socket.on('activate', function (data, holla) {
     clog({subject: 'user', username: username, userid: userid, action: 'activate'});
     socket.broadcast.to(userid).emit('deactivate');
   });
   socket.on('disconnect', function () {
     clog({subject: 'user', username: username, userid: userid, action: 'disconnect'});
   });

  }

});
