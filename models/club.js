var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
require('mongoose-type-email');

var clubSchema = mongoose.Schema({
	name: {
		type: String,
		index: true, 
		unique: true,
		required: true
	},
	password: {
		type: String
	},
	userid: {
		type: String
	},
	alias: {
		type: String
	},
	email: {
		type: mongoose.SchemaTypes.Email
	},
	photos: [
		{
			name: {
				type:String
			},
			src: {
				type:String
			}
		}
	],
	summary: {
		type: String
	},
	logo: {
		type: String
	},
	phone: {
		type: String
	},
	president: {
		type: String
	},
	newDepartments: [ {
			type: String
		}
	],
	events: [
	{
		type: String
	}]

});

var Club = module.exports = mongoose.model('Club', clubSchema);

module.exports.createClub = function(newClub, callback) {
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newClub.password, salt, function(err, hash) {
	        newClub.password = hash;
	        newClub.save(callback);
	    });
	});
}

module.exports.getClubByName = function(clubname, callback) {
	Club.findOne({name: clubname}, callback);
}

module.exports.getClubById = function(clubid, callback) {
	Club.findById(clubid, callback);
}

module.exports.getClubByUserId = function(userid, callback) {
	Club.findOne({userid: userid}, callback);
}

module.exports.validatePassword = function(givenpassword, hash, callback) {
	bcrypt.compare(givenpassword, hash, function(err, res) {
	    if(err) throw err;
	    callback(null, res);
	});
}

