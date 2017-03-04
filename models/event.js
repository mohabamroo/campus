var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var eventSchema = mongoose.Schema({
	name: {
		type: String
	},
	organizer: {
		type: String
	},
	fromDate: {
		type: String
	},
	fromTime: {
		type: String
	},
	toDate: {
		type: String
	},
	toTime: {
		type: String
	},
	description: {
		type: String
	},
	logo: {
		type: String
	},
	photos: [
		{
			type: String
		}
	],
	location: {
		type: String
	},
	type: {
		type: String
	}

});

var Event = module.exports = mongoose.model('Event', eventSchema);

module.exports.createEvent = function(newEvent, callback) {
	newEvent.save(callback);
}

module.exports.getEventbyEventname = function(eventName, callback) {
	Event.findOne({name: eventName}, callback);
}

module.exports.getEventById = function(eventId, callback) {
	Event.findById(eventId, callback);
}

