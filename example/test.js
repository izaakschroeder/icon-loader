import Icons, { MyIcon } from 'icons';
import React, { Component, renderToString } from 'react';

class Example extends Component {
	render() {
		return <div><MyIcon/><Icons.MyIcon/></div>;
	}
}

console.log(renderToString(<Example/>));
