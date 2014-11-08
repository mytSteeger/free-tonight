var db = require('./db');

exports.tags = function(req, res) {
	db.getAllTags(function(error, objects) {
		if (error) return res.send(500, 'db error');
		return res.send(200, objects);
	});
}

exports.user = function(req, res) {
	res.send(204);
}

exports.postTagsForUser = function(req, res) {
	res.send(400, 'not implemented!');
}