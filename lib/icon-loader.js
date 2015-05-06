
var _ = require('lodash'),
	bl = require('bl'),
	fs = require('fs'),
	path = require('path'),
	loaderUtils = require('loader-utils'),
	svgicons2svgfont = require('svgicons2svgfont');


var templates = {
	glyph: _.template('.icon-<%= name %>::before { ' +
		'@extend %icon; content: "\\<%= codepoint %>"; ' +
	'}')
};

function styles(glyphs) {

	return _.chain(glyphs)
		.map(function(glyph) {
			return templates.glyph({
				name: glyph.name,
				codepoint: glyph.codepoint.toString(16)
			});
		})
		.join('\n')
		.value();
}

module.exports = function(source) {
	this.cacheable();

	var self = this;
	var callback = this.async();

	var name = 'my-font',
		codepoints = { },
		lastCodePoint = 0xE001,
		query = loaderUtils.parseQuery(this.query),
		base = this.context;

	//

	function interpolateName(ex, content) {
		return loaderUtils.interpolateName(self, query.name || "[hash]." + ex, {
			context: query.context || self.options.context,
			content: content,
			regExp: query.regExp
		});
	}

	function output(item, ext) {
		var name = interpolateName(ext, item);
		var base = self.options.output.path;
		self.emitFile(name, item);
		return name;
	}

	function codepoint(desired) {
		if (desired) {
			if (codepoints[desired]) {
				callback('reused codepoint');
			} else {
				codepoints[desired] = true;
				return desired;
			}
		} else {
			while (codepoints[lastCodePoint]) {
				++lastCodePoint;
			}
			codepoints[lastCodePoint] = true;
			return lastCodePoint;
		}
	}

	if (err) {
		callback(err);
		return;
	}

	var glyphs = _.chain(files)
		.filter(function(file) {
			return /\.svg$/.test(file);
		})
		.map(function(file) {
			return path.join(base, file);
		})
		.map(function(file) {
			var name = path.basename(file, '.svg');

			return {
				name: name,
				codepoint: codepoint(0),
				file: file,
				stream: fs.createReadStream(file)
			}
		})
		.value();


	svgicons2svgfont(glyphs, {
		fontName: name,
		descent: 150,
		fontHeight: 1000
	}).pipe(bl(function(err, svg) {

		if (err) {
			callback(err);
			return;
		}

		callback(null,
			JSON.stringify({
				name: 'My Icon Font',
				files: [{
					file: emit(name, svg)
				}]
			})
		);

	}));



};
