var mysql = require('mysql');

var connection = mysql.createConnection({
	host: 'sql4.freesqldatabase.com',
	user: 'sql457486',
	database: 'sql457486',
	password: 'aQ5!jE3%'
});

exports.getAllTags = function(callback) {
	connection.query('SELECT * from tags', function(err, rows, fields) {
		if (err) {
			console.log(err);
			return callback(err, undefined);
		}
		var tags = rows.map(function(argument) {
			return argument.tagname;
		});
		console.log(tags);

		return callback(undefined, tags);
	});
	// var fixedTags = ['table-soccer', 'drink-beer', 'run', 'table-football'];
	// return fixedTags;
}