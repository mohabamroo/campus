var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var memberSchema = mongoose.Schema({
	name: {
		type: String
	},
	gucid: {
		type: String
	},
	profileId :{
		type: String
	},
	exists: {
		type: String
	},
	rating: {
		type: String
	},
	review: {
		type: String
	},
	club: {
		type: String
	},
	role: {
		type: String
	},
	profilephoto: {
		type: String
	},
	clubID: {
		type: String
	},
	departmentID: {
		type: String
	},
	subDepartmentID: {
		type: String
	}
});

var Member = module.exports = mongoose.model('Member', memberSchema);

module.exports.createMember = function(newMember, callback) {
	newMember.save(callback);
}

module.exports.getMemberByName = function(memberName, callback) {
	Member.findOne({name: memberName}, callback);
}

module.exports.getMemberByID = function(memberID, callback) {
	Member.findById(memberID, callback);
}

module.exports.getDepartmentByClubName = function(clubName, callback) {
	Department.findOne({club: Name}, callback);
}


