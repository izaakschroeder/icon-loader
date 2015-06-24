
var _ = require('lodash'),
	bl = require('bl'),
	SVGO = require('svgo'),
	svgicons2svgfont = require('svgicons2svgfont'),
	Promise = require('bluebird');

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


function styles(glyphs) {

	return _.chain(glyphs)
		.map(function handleGlyph(glyph) {
			return templates.glyph({
				name: glyph.name,
				codepoint: glyph.codepoint.toString(16)
			});
		})
		.join('\n')
		.value();
}

function codepoints(icons) {
	var result = { };
}

function generate(meta, icons, callback) {

	var stream = svgicons2svgfont({
		fontName: meta.name,
		descent: meta.descent,
		fontHeight: meta.descent + meta.ascent,
		fixedWidth: false,
		centerHorizontally: false,
		normalize: false,
		round: 10e12,
		metadata: 'Wee fonts!',
		log: _.noop
	});

	// Write all the icon data to the stream.
	_.forEach(icons, function writeIcon(icon) {
		svgo.optimize(icon.data.toString('utf8'), function(res) {

			stream.write(_.assign(bl(new Buffer(res.data)), {
				metadata: {
					name: icon.name || 'some name',
					unicode: ['\\E934']
				}
			}));
		});

	});

	// Prepare to collect font output.
	stream.pipe(bl(callback));

	// Trigger.
	stream.end();
}

module.exports = Promise.promisify(generate);
