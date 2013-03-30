var passport = require('passport'),
    Account = require('./models/account');

module.exports = function (app) {

    app.get('/', function (req, res) {
        res.render('index', { user : req.user });
    });

    app.get('/homebase', function(req, res) {
        res.render('homebase', { user : req.user });
    });

    app.get('/register', function(req, res) {
        res.render('register', { });
    });

    app.post('/register', function(req, res) {
        Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
            if (err) {
                return res.render('register', { account : account });
            }
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
