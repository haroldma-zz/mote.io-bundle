var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
	date_created: Date,
  beta: Boolean,
  reset: String,
  reset_expires: Date,
  random: Number,
  channel: String
});

Account.plugin(passportLocalMongoose, {
	iterations: 250,
	incorrectPasswordError: "Bad password. Please try again or reset it at http://mote.io/reset.",
	incorrectUsernameError: "Can not find account with that email address. Visit http://mote.io/start on your computer."
});

module.exports = mongoose.model('Account', Account);
