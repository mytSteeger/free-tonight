var mysql = require('mysql');
var squel = require('squel');

var connection = mysql.createConnection({
	host: 'sql4.freesqldatabase.com',
	user: 'sql457486',
	database: 'sql457486',
	password: 'aQ5!jE3%'
});

exports.getAllTags = function(callback) {
	var queryString = squel.select().field("T.tagID").field("T.tagname").field("count(*)", "count").from("tags", "T").join("interests", "I", "I.tagID = T.tagID").group('T.tagID').toString();
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
			return callback(err, undefined);
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
				return callback(err, undefined);
			}
			return callback(undefined, rows.insertedId);
		});
	});
}

exports.tagsAndFollowerForUser = function(token, callback) {
	var queryString = "SELECT I.tagID, I.userID, U.alias, T.tagname FROM interests I JOIN users U ON (I.userID = U.userID) JOIN tags T ON (I.tagID = T.tagID) WHERE I.tagID IN ( SELECT I.tagID FROM interests I WHERE (I.userID = (SELECT U.userID FROM users U WHERE (U.token = '" + token + "')))) ORDER BY I.tagID";
	connection.query(queryString, function(err, rows, fields) {
		if (err) return callback(err, undefined);
		var results = {};
		rows.forEach(function(row) {
			if (results[row.tagID] === undefined) {
				results[row.tagID] = {
					tagname: row.tagname,
					members: [row.alias]
				};
			} else {
				results[row.tagID].members.push(row.alias);
			}
		});
		var resultArray = [];
		for (var property in results) {
			if (results.hasOwnProperty(property)) {
				resultArray.push({
					tagID: property,
					tagname: results[property].tagname,
					members: results[property].members
				});
			}
		}
		return callback(undefined, resultArray);
	});
}