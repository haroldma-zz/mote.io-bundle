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

        Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {

            sendgrid.send({
              to: req.body.username,
              from: 'hello@mote.io',
              subject: 'Welcome to the wonderful world of mote.io',
              text:
              'Welcome to the wonderful world of mote.io.' +
              '<br/>' +
              '<br/>' +
              'Thanks for testing out the alpha. Instructions for getting started can be found here:' +
              '<br/>' +
              'http://mote.io/start' +
              '<br/>' +
              '<br/>' +
              'Follow me on twitter for more updates about mote.io' +
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

            res.redirect('/start');

        });
    });

    app.get('/login', function(req, res) {
        if(req.user) {
            res.redirect('/start');
        } else {
            res.render('login', { page: 'start' });
        }
    });

    app.get('/get/login', function(req, res) {
        if(req.user) {
            res.jsonp({
                valid: true,
                user: {
                    username: req.user.username,
                    _id: req.user._id
                }
            });
        } else {
            res.jsonp({
                valid: false
            });
        }
    });

    app.post('/post/login', passport.authenticate('local'), function(req, res) {
        if(req.user) {
            res.redirect('/start');
        } else {
            res.render('login', {page: 'start'});
        }
    });

    app.get('/post/login', passport.authenticate('local'), function(req, res) {
        if(req.user) {
            res.jsonp({
                valid: true,
                user: {
                    username: req.user.username,
                    _id: req.user._id
                }
            });
        } else {
            res.jsonp({
                valid: false
            });
        }
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

};
