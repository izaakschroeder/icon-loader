



module.exports = function(source) {

	var _this = this;
	var callback = this.async();

	this.cacheable();

	// WOW THIS IS HACKY
	if (/\.(css|sass|scss)$/.test(this.resourcePath)) {
		callback(null, source);
		return;
	}

	this.values = [source];
	callback(null, '/* some icon */');
};
