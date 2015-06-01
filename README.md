# icon-loader

Load SVG icons.

TODO:
 * [ ] Allow individual icon loading

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

TODO:
 * Support for ligatures https://github.com/nfroidure/svgicons2svgfont/pull/27
 * Support spritemaps for non-svg
 * Support automatic retina sizing for non-svg
 * Support for inline svg via https://github.com/iconic/SVGInjector

https://github.com/jakesgordon/bin-packing
https://github.com/richardbutler/node-spritesheet
