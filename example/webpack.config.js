
var _ = require('lodash'),
	path = require('path'),
	webpack = require('webpack'),
	Promise = require('bluebird'),
	ExtractTextPlugin = require('extract-text-webpack-plugin');

var font = require('../lib/font');

function MyPlugin() {

}

function inherit(icon) {
	return _.assign({ }, icon, _.find(icon.meta.icons, function(search) {
		return path.join(icon.context, search.path) === icon.resource;
	}));
}

// compiler.inputFileSystem
MyPlugin.prototype.apply = function(compiler) {

	compiler.plugin('compilation', function(compilation) {
		var ifs = compiler.inputFileSystem;
		var read = Promise.promisify(ifs.readFile, ifs);
		compilation.plugin('optimize-chunks', function(chunks) {

			var metas = { };

			// TODO: Make this better.
			function meta(mod) {
				var name = mod.context;
				if (!metas[name]) {
					metas[name] = read(path.join(name, 'icons.json'))
						.then(JSON.parse)
						.catch(_.constant(Promise.resolve({})));
				}
				return metas[name];
			}

			// Generate all the desired assets.
			var d = _.chain(chunks)
				// Get all the module data.
				.pluck('modules')
				.flatten()

				// Only pick out things that were targeted by the icon loader
				// and appear to be an icon.
				.filter(function(mod) {
					return mod.issuer
						&& /\.(svg|png|jpg|gif|webp)/.test(mod.resource)
						&& _.find(mod.loaders, function(loader) {
							return /icon-loader\.js/.test(loader);
						});
				})

				// Transform into a useful object which includes original icon
				// data. Reading from the fs is actually cheap here, since it's
				// already cached in memory from when the import/require call
				// was made.
				.map(function(mod) {
					return _.assign({
						data: read(mod.resource),
						meta: meta(mod)
					}, _.pick(mod, 'resource', 'issuer', 'context'));
				})

				// Organize the icons into "icon-packs"; these are essentially
				// units of output for icons. Each icon pack will have its own
				// font or spritemap or what have you.
				.groupBy(function(mod) {
					return path.basename(mod.context);
				})

				// For every pack generate the desired outputs.
				.mapValues(function(icons) {

					return Promise.all(
						_.map(icons, Promise.props)
					).then(function(icons) {
						icons = _.map(icons, inherit);
						return font(icons[0].meta, icons);
					}).then(function(font) {
						console.log('le font', font);
					});


					// Collect metadata for the pack(s) if they exists.
					// Use that metadata to augment icons with things like names
					// and codepoints.
					//read(path.join(pack[0].context, 'icons.json'))

					// Process icon fonts.

					// Process sprite maps.

					// Other?
				})

				// We're done here.
				.value();

			// Go back through all the chunks and inject the generated assets
			// where they belong.

		});
	});
}

// Export the webpack configuration
module.exports = {
	entry: {
		'test.css': './test.css',
		// 'test.scss.css': './test.scss'
		// 'test.js': './test.js'
	},

	// Output controls the settings for file generation.
	output: {
		filename: '[name].[hash].js',
		path: path.join(__dirname, 'build'),
		chunkFilename: '[id].[hash].js'
	},

	// Module settings.
	module: {
		loaders: [{
			test: /\.css$/,
			loaders: [
				ExtractTextPlugin.loader({
					extract: true,
					omit: 1
				}),
				'style',
				'css?importLoaders=2',
				'icon'
			]
		}, {
			test: /\.scss$/,
			loaders: [
				ExtractTextPlugin.loader({
					extract: true,
					omit: 1
				}),
				'style',
				'css?importLoaders=2',
				'icon',
				'font?format[]=truetype&format[]=woff&format[]=embedded-opentype',
				'sass'
			]
		}]
	},

	plugins: [
		new MyPlugin(),
		new ExtractTextPlugin('[name].[hash].css')
	]
};
