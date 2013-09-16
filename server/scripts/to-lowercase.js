
var
  passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  passportLocalMongoose = require('passport-local-mongoose'),
  express = require('express'),
  app = express(),
  MongoStore = require('connect-mongo')(express),
  config = {},
  Account = require('../models/account'),
  check = require('validator').check,
  sanitize = require('validator').sanitize,
  clog = null,
  sanitizer = require('sanitizer'),
  crypto = require('crypto');


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
    port: 3000,
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

}

function capitaliseFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

clog({subject: "server", action: "boot"});

Account.find({}, function (err, all_users) {

	for (var i = 0; i < all_users.length; i++) {

		console.log(all_users[i].username)

		Account.find({username: all_users[i].username}, function (err, users) {

			if(users.length > 1) {

				console.log(users[0].username + ' has a dupe');

				users[0].username = users[0].username.toLowerCase();
				users[0].save();

				Account.remove({_id: users[0].id}, function(err, users) {
					console.log('user removed')
				});

			} else {
				console.log('clear');
			}

		});

	}

});
