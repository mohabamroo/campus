var mongoose = require('mongoose');

var offerSchema = mongoose.Schema({
	company: {
		type: String
	},
	description: {
		type: String
	},
	summary: {
		type: String
	},
	from: {
		type: String
	},
	to: {
		type: String
	},
	photo: {
		type: String
	},
	type: {
		type: String
	},
	location: {
		type: String
	}
});

var Offer = module.exports = mongoose.model('Offer', offerSchema);

module.exports.createOffer = function(newOffer, callback) {
	newOffer.save(callback);
}

module.exports.getOfferByID = function(offerID, callback) {
	Offer.findById(offerID, callback);
}

