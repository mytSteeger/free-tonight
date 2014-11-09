var mysql = require('mysql');
var squel = require('squel');

var connection = mysql.createConnection({
	host: 'sql4.freesqldatabase.com',
	user: 'sql457486',
	database: 'sql457486',
	password: 'aQ5!jE3%'
});

exports.getAllTags = function(callback) {
	var queryString = squel.select().field("T.tagID").field("T.tagname").field("count(*)","count").from("tags", "T").join("interests", "I", "I.tagID = T.tagID").group('T.tagID').toString();
	connection.query(queryString, function(err, rows, fields) {
		if (err) {
			return callback(err, undefined);
		}
		return callback(undefined, rows);
	});
}

exports.getTagForName = function(tagname, callback) {
	var queryString = squel.select().from("tags").where("tagname = ?", tagname).toString();
	connection.query(queryString, function(err, rows, fields) {
		if (err) {
			return callback(err, undefined);
		}
		return callback(undefined, rows[0]);
	});
}

exports.createTag = function(tagName, callback) {
	var queryString = squel.insert()
		.into("tags")
		.setFieldsRows([{
			tagID: null,
			tagname: tagName
		}]).toString();
	connection.query(queryString, function(err, rows, fields) {
		if (err) {
			return callback(err, undefined);
		}
		return callback(undefined, rows.insertId);
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

exports.getTagIdNameAndCount = function(callback) {
	var queryString = "SELECT A.*, B.tagname FROM (SELECT tagID, count(*) count FROM `interests` GROUP BY tagID) A INNER JOIN tags B ON A.tagID=B.tagID";
	connection.query(queryString, function(err, rows, fields) {
		if (err) {
			return callback(err, undefined);
		}
		return callback(undefined, rows);
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
		token: ["tokenFOO1", "tokenBAR2", "tokenFOO12", "tokenBAR22"]
	}]);
}