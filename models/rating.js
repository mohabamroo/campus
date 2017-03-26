var mongoose = require('mongoose');

var ratingSchema = mongoose.Schema({
	memberID: {
		type: String
	},
	raterID: {
		type: String
	},
	rating: {
		type: String
	}
});

var Rating = module.exports = mongoose.model('Rating', ratingSchema);

module.exports.createRating = function(newRating, callback) {
	newRating.save(callback);
}

module.exports.getRatingsByMemberId = function(memberID, callback) {
	Rating.find({memberID: memberID}, callback);
}

module.exports.getRatingByRaterID = function(raterID, callback) {
	Rating.findOne({raterID: raterID}, callback);
}

module.exports.getRatingByID = function(ratingID, callback) {
	Rating.findById(ratingID, callback);
}

