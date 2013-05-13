var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
    beta: Boolean,
    reset: String,
    reset_expires: Date
});

Account.plugin(passportLocalMongoose, {iterations: 250});

module.exports = mongoose.model('Account', Account);
