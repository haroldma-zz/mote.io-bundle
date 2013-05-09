var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
    beta: Boolean,
    reset: Boolean
});

Account.plugin(passportLocalMongoose);
// Account.plugin(passportLocalMongoose,  {iterations:1000});

module.exports = mongoose.model('Account', Account);
