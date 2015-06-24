# icon-loader

Load some icons.


Roughly:
 * `@import` resolves to an image file (svg/png/etc.)
 * `icon-loader` transforms that image file into CSS with refs
 * collect all icons referenced and
  * pack their css + glyphs into font
  * pack their images into spritemaps
 * for every entry point inject a url to the font/spritemaps

By default bundle icons in their original modules? e.g. icons-foo and icons-bar generate icons-foo.svg and icons-bar.svg unless loader configures name; e.g. `icons?name=baz` then both would be merged into one.

TODO:
 * [ ] Allow individual icon loading
 * [ ] Support for ligatures https://github.com/nfroidure/svgicons2svgfont/pull/27
 * [ ] Support spritemaps for non-svg
 * [ ] Support automatic retina sizing for non-svg
 * [ ] Support for inline svg via https://github.com/iconic/SVGInjector

Configure webpack. To use icon fonts, [font-loader] must also be enabled.

```javascript
{
	modules: {
		loaders: [{
			// Only use image files in the `icons` folder.
			include: /icons\//,
			test: /\.(svg|png|webp)$/,
			loader: 'icon'
		}, {
			// For icon font support.
			test: /\.font\.json$/,
			loader: 'font?format=woff'
		}]
	}
}
```

Use your icons!

SCSS/SASS/CSS:

```css
/* Import an individual icon */
@import "icons/my-icon";
/* Import all the icons */
@import "icons";

.some-class {
	/* Add the appropriate CSS. */
	@include .icons-my-icon;
}
```

React:

```javascript
import Icons, { MyIcon } from 'icons';

/*
Icon.glyph?
Icon.font?
Icon.image?
...
 */

export default class Something extends Component {
	render() {
		return <div><MyIcon/><Icons.MyIcon/></div>;
	}
}
```

Using multiple icon libraries:

```javascript
// Import all the icons you want to use.
import FontAwesome from 'icons-fontawesome';
import MyIcons from './icons-sample';

// It can be useful to give semantic meaning to your icons, encoding their
// purpose instead of just their glyph.
const Aliases = {
	Error: FontAwesome.Alert,
	Success: MyIcons.Checkmark
};

// Export everything.
export {...FontAwesome ...MyIcons ...Aliases};
```


https://github.com/jakesgordon/bin-packing
https://github.com/richardbutler/node-spritesheet
