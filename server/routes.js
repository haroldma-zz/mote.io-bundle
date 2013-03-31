var passport = require('passport'),
    Account = require('./models/account'),
    check = require('validator').check,
    sanitize = require('validator').sanitize;

module.exports = function (app) {

    app.get('/', function (req, res) {
        res.render('index', { user : req.user });
    });

    app.get('/homebase', function(req, res) {
        res.render('homebase', { user : req.user });
    });

    app.get('/register', function(req, res) {
        res.render('register', {err: null, user: req.user });
    });

    app.post('/register', function(req, res) {
        try {
            check(req.body.username, 'Please enter a valid email address.').len(6, 64).isEmail();
            check(req.body.password, 'Please enter a password between 3 and 64 characters.').len(3, 64);
        } catch (err) {
            return res.render('register', { user : null, err: err });
        }

        Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
            return res.render('register', { user : account, err: err });
        });
    });

    app.get('/login', function(req, res) {
        if(req.user) {
            res.render('index', { user : req.user });
        } else {
            res.render('login');
        }
    });

    app.get('/login/json', function(req, res) {
        if(req.user) {
            res.json({
                valid: true,
                user: {
                    username: req.user.username
                }
            });
        } else {
            res.json({
                valid: false
            });
        }
    });

    app.post('/login/json', passport.authenticate('local'), function(req, res) {
        if(req.user) {
            res.json({
                valid: true,
                user: {
                    username: req.user.username
                }
            });
        } else {
            res.json({
                valid: false
            });
        }
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

};
