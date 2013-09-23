var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
  beta: Boolean,
  reset: String,
  reset_expires: Date,
  random: Number,
  channel: String
});

Account.plugin(passportLocalMongoose, {iterations: 250});

module.exports = mongoose.model('Account', Account);
