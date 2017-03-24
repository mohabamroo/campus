var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
require('mongoose-type-email');

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
		}
	},
	members: [
		{
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
			}
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
				}
			},
			members: [
				{
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
					}
				}
			],
		}
	]
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


