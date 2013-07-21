var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Server = new Schema({
	id: String,
	fileLocation: String,
	hostId: String,
	ip: String,
	projectId: String,
	status:  String
});

module.exports = mongoose.model('Server', Server);
