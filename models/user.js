var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
require('mongoose-type-email');

var userSchema = mongoose.Schema({
	username: {
		type: String,
		index: true, 
		unique: true,
		required: true
	},
	password: {
		type: String
	},
	gucid: {
		type: String,
		unique: true
	},
	usertype: {
		type: String
	},
	name: {
		type: String
	},
	email: {
		type: mongoose.SchemaTypes.Email
	},
	links: [
		{
			name: {
				type: String
			},
			url: {
				type: String
			}
		}
	],
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
	organizations: [
		{
			role: {
				type: String
			},
			rating: {
				type: String
			},
			review: {
				type: String
			},
			name: {
				type: String
			}
		}
	],
	summary: {
		type: String
	},
	profilephoto: {
		type: String
	},
	portifolio: {
		type: String
	},
	phone: {
		type: String
	},
	tags: [
		{
			type: String
		}
	]

});

var User = module.exports = mongoose.model('User', userSchema);

module.exports.createUser = function(newUser, callback) {
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.password, salt, function(err, hash) {
	        newUser.password = hash;
	        newUser.save(callback);
	    });
	});
}

module.exports.getUserbyUsername = function(username, callback) {
	User.findOne({username: username}, callback);
}

module.exports.getUserByGucId = function(gucid, callback) {
	User.findOne({gucid: gucid}, callback);
}

module.exports.getUserById = function(userid, callback) {
	User.findById(userid, callback);
}

module.exports.validatePassword = function(givenpassword, hash, callback) {
	bcrypt.compare(givenpassword, hash, function(err, res) {
	    if(err) {
	    	console.log(err);
	    	throw err;
	    } 
	    callback(null, res);
	});
}

