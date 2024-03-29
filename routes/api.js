var db = require('./db');
var push = require('../lib/push');

exports.tags = function(req, res) {
	db.getAllTags(function(error, objects) {
		if (error) return res.send(500, error);
		return res.send(200, objects);
	});
}

exports.addTag = function(req, res) {
	req.checkParams('tagname', 'invalid tagname!').notEmpty();
	var errors = req.validationErrors();

	if (errors) {
		return res.send(400, errors);
	}

	db.getTagForName(req.params.tagname, function(err, tagObj) {
		if (err) {
			return res.send(500, err);
		}
		if (tagObj) {
			return res.send(200, tagObj);
		}
		db.createTag(req.params.tagname, function(err, tagId) {
			if (err) {
				return res.send(500, err);
			}
			return res.send(200, {
				tagID: tagId,
				tagname: req.params.tagname
			});
		});
	});
}

exports.user = function(req, res) {
	req.checkParams('token', 'Invalid token').notEmpty();
	var errors = req.validationErrors();

	if (errors) {
		return res.send(400, errors);
	}

	return isNewUser(req.params.token, function(error, isNew) {
		if (error) {
			return res.send(500, error);
		}
		if (isNew) {
			return res.send(204);
		}
		return db.tagsAndFollowerForUser(req.params.token, function(error, object) {
			if (error) {
				return res.send(500, error);
			}
			return res.send(200, object);
		});
	});
}

exports.postTagsForUser = function(req, res) {
	req.checkParams('token', 'Invalid token').notEmpty();
	req.checkBody('alias', 'Invalid alias').notEmpty();
	req.checkBody('platform', 'Invalid platform').notEmpty();
	req.checkBody('tags', 'Invalid tags').notEmpty();

	var errors = req.validationErrors();

	if (errors) {
		return res.send(400, errors);
	}
	return isNewUser(req.params.token, function(err, isNew) {
		if (err) {
			return res.send(500, err);
		}
		if (!isNew) {
			return res.send(400, 'user is already free tonight!');
		}

		var user = {
			'token': req.params.token,
			'alias': req.body.alias,
			'platform': req.body.platform.toUpperCase(),
			'tags': req.body.tags
		};
		return db.addUser(user, function(err, userId) {
			if (err) {
				return res.send(500);
			}
			searchMatchesForAllUsers();
			return res.send(204);
		});
	});
}

exports.removeUser = function(req, res) {
	req.checkParams('token', 'Invalid token').notEmpty();
	var errors = req.validationErrors();
	if (errors) return res.send(400, errors);
	db.removeUser(req.params.token, function(err) {
		if (err) {
			if (err.errorCode == 404) {
				return res.send(404);
			}
			return res.send(500, err);
		}
		return res.send(204);
	});
}

exports.getAllMessages = function(req, res) {
	req.checkParams('tagID', 'Invalid tagID').notEmpty();
	var errors = req.validationErrors();
	if (errors) {
		return res.send(400, errors);
	}
	db.getMessages(req.params.tagID, function(err, messages) {
		if (err) return res.send(500, err);
		res.send(200, messages);
	});
}

exports.postNewMessage = function(req, res) {
	// req.checkParams('tagID', 'Invalid tagID').notEmpty();
	// req.checkBody('message',).notEmpty;
	// var errors = req.validationErrors();
	// if (errors) {
	// 	return res.send(400, errors);
	// }
}

function searchMatchesForAllUsers() {
	db.getAllUser(function(err, users) {
		if (!err) {
			users.forEach(function(user) {
				db.tagsAndFollowerForUser(user.token, function(err, objects) {
					if (err) console.error(err);
					var shouldSendPush = false;
					objects.forEach(function(object) {
						shouldSendPush = (shouldSendPush) || (object.members.length >= 2)
					});
					if (shouldSendPush) {
						console.log("sending push");
						push.sendTagToUser(user, objects);
					}
				});
			});
		}
	});
}

function isNewUser(token, callback) {
	return db.checkIfUserIsNew(token, function(err, isNew) {
		return callback(err, isNew);
	});
}