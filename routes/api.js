exports.tags = function(req, res) {
	var fixedTags = ['table-soccer', 'drink-beer', 'run'];
	res.send(200, fixedTags);
}