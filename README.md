# icon-loader

Load SVG icons.

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
