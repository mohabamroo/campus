var mongoose = require('mongoose');

var departmentSchema = mongoose.Schema({
	nestedType: {
		type: String
	},
	public: {
		type: String
	},
	name: {
		type: String
	},
	head: {
		type: String
	},
	members: [
		{
			type: String
		}
	],
	subDepartments: [
		{
			public: {
				type: String
			},
			name: {
				type: String
			},
			head: {
				type: String
			},
			members: [
				{
					type: String
				}
			],
		}
	],
	clubID: {
		type: String
	},
	clubName: {
		type: String
	}
});

var Department = module.exports = mongoose.model('Department', departmentSchema);

module.exports.createDepartment = function(newDepartment, callback) {
	newDepartment.save(callback);
}

module.exports.getDepartmentByName = function(departmentname, callback) {
	Department.findOne({name: departmentname}, callback);
}

module.exports.getDepartmentById = function(departmentid, callback) {
	Department.findById(departmentid, callback);
}

module.exports.getDepartmentByClubId = function(clubid, callback) {
	Department.findOne({clubid: userid}, callback);
}


