
var _ = require('lodash'),
	bl = require('bl'),
	fs = require('fs'),
	path = require('path'),
	loaderUtils = require('loader-utils'),
	SVGO = require('svgo'),
	svgicons2svgfont = require('svgicons2svgfont');

var svgo = new SVGO({
	removeDoctype: true,
	removeXMLProcInst: true,
	removeComments: true,
	removeMetadata: true,
	removeEditorsNSData: true,
	cleanupAttrs: true,
	convertStyleToAttrs: true,
	removeRasterImages: true,
	cleanupNumericValues: true,
	convertColors: true,
	removeUnknownsAndDefaults: true,
	removeNonInheritableGroupAttrs: true,
	removeUselessStrokeAndFill: true,
	removeViewBox: true,
	cleanupEnableBackground: true,
	removeHiddenElems: true,
	removeEmptyText: true,
	moveElemsAttrsToGroup: true,
	collapseGroups: true,
	moveGroupAttrsToElems: true,
	convertTransform: true,
	convertPathData: {
		negativeExtraSpace: false,
		straightCurves: false
	},
	removeEmptyAttrs: true,
	removeEmptyContainers: true,
	mergePaths: true,
	cleanupIDs: true,
	removeUnusedNS: true
});

function createGlyphStream(path) {

	function collect(t) {
		var buffers = [ ];
		return through2(function(chunk, enc, cb) {
			buffers.push(chunk);
			cb();
		}, function(cb) {
			t(Buffer.join(buffers), cb);
		});
	}

	return fs.createReadStream(path).pipe(collect(svgo.optimize));
}



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

	var _this = this;
	var callback = this.async();

	this.cacheable();

	console.log(this.resourcePath);

	// WOW THIS IS HACKY
	if (/\.(css|sass|scss)$/.test(this.resourcePath)) {
		callback(null, source);
		return;
	}

	console.log('CONTEXT', this.context);


	var meta = JSON.parse(source),
		codepoints = { },
		lastCodePoint = 0xE001,
		query = loaderUtils.parseQuery(this.query),
		base = this.context;

	//

	function interpolateName(font) {
		var name = [
			_.kebabCase(meta.name)
		].join('-') + '.[hash:8].svg';
		return loaderUtils.interpolateName(_this, name, {
			context: query.context || _this.options.context,
			content: font.data,
			regExp: query.regExp
		});
	}

	function output(item, ext) {
		var name = interpolateName(ext, item);
		var base = _this.options.output.path;
		_this.emitFile(name, item);
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
				stream: createGlyphStream(file)
			}
		})
		.value();


	svgicons2svgfont(glyphs, {
		fontName: meta.name,
		descent: meta.descent,
		fontHeight: meta.descent + meta.ascent
	}).pipe(bl(function(err, svg) {

		if (err) {
			callback(err);
			return;
		}

		var file = emit(name, svg);

		callback(null,
			JSON.stringify({
				name: meta.name,
				files: [{
					file: file
				}]
			})
		);

	}));



};
