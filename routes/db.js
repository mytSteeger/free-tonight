var mysql = require('mysql');
var squel = require('squel');

var connection = mysql.createConnection({
	host: 'sql4.freesqldatabase.com',
	user: 'sql457486',
	database: 'sql457486',
	password: 'aQ5!jE3%'
});

exports.getAllTags = function(callback) {
	var queryString = squel.select().from('tags').toString();
	connection.query(queryString, function(err, rows, fields) {
		if (err) {
			return callback(err, undefined);
		}
		var tags = rows.map(function(argument) {
			return {
				tagID: argument.tagID,
				tagname: argument.tagname
			};
		});
		console.log(tags);

		return callback(undefined, tags);
	});
}

exports.checkIfUserIsNew = function(token, callback) {
	var queryString = squel.select().from('users').where('token = ?', token).toString();
	connection.query(queryString, function(err, rows, fields) {
		if (err) {
			return callback(err, undefined);
		}
		return callback(undefined, rows.length == 0);
	});
}

exports.addUser = function(user, callback) {
	var queryString = squel.insert()
		.into("users")
		.set("userID", null)
		.set("token", user.token)
		.set("alias", user.alias)
		.set("platform", user.platform).toString();
	connection.query(queryString, function(err, rows, fields) {
		if (err) {
			return callback(err);
		}
		var userId = rows.insertId;
		var tagList = "";

		user.tags.forEach(function(tag) {
			tagList = tagList + '\'' + tag + '\'' + ', '
		});

		if (tagList.length >= 2) {
			tagList = tagList.substring(0, tagList.length - 2);
		}
		var string = "INSERT INTO interests(userID, tagID) SELECT " + userId + ", tagID FROM tags WHERE tagname IN (" + tagList + ")";

		connection.query(string, function(err, rows, fields) {
			if (err) {
				return callback(err);
			}
			return callback(undefined);
		});
	});
}

exports.tagsAndFollowerForUser = function(token, callback) {
	callback(undefined, [{
		tagID: 3,
		tagname: "foo",
		token: ["tokenFOO1", "tokenBAR2"]
	}, {
		tagID: 2,
		tagname: "bar",
		token: ["tokenFOO1", "tokenBAR2","tokenFOO12", "tokenBAR22"]
	}]);
}