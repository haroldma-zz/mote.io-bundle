var passport = require('passport'),
    Account = require('./models/account'),
    check = require('validator').check,
    sanitize = require('validator').sanitize;

var SendGrid = require('sendgrid').SendGrid;
var sendgrid = new SendGrid('sw1tch', '0K1:a7P68G-i95;');

module.exports = function (app) {

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

            console.log(req.query.user)

            Account.findById(req.query.user, function(err,user){
                if(err) {
                    console.log(err)
                    res.redirect('/')
                } else {
                    user.beta = true;
                    user.save(function(){

                        console.log('saved')
                        console.log(user)
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
                            console.log(message);
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
                    console.log(message);
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

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

};
