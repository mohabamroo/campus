var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
require('mongoose-type-email');

var tagSchema = mongoose.Schema({
	tag: {
		type: String
	},
	users: [
		{
			username: {
				type: String
			},
			profileid: {
				type: String
			},
			photo: {
				type: String
			}
		}
	]
});

var Tag = module.exports = mongoose.model('Tag', tagSchema);

module.exports.createTag = function(newUser, callback) {
	newUser.save(callback);
}

module.exports.getTagbyTagname = function(tagname, callback) {
	Tag.findOne({tag: tagname}, callback);
}

module.exports.getTagById = function(tagid, callback) {
	Tag.findById(tagid, callback);
}

