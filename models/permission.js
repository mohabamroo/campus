var mongoose = require('mongoose');

var permissionSchema = mongoose.Schema({
	departmentID: {
		type: String
	},
	profileId: {
		type: String
	},
	permission: {
		type: String
	}
});

var Permission = module.exports = mongoose.model('Permission', permissionSchema);

module.exports.createPermission = function(newPermission, callback) {
	newPermission.save(callback);
}

module.exports.getPermissionbyDepartmentID = function(departmentID, callback) {
	Permission.findOne({departmentID: departmentID}, callback);
}

module.exports.getPersmissionByProfileID = function(profileID, callback) {
	Permission.findOne({profileID: profileID}, callback);
}

module.exports.getPersmissionByID = function(permissionID, callback) {
	Permission.findById(permissionID, callback);
}

