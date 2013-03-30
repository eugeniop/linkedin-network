var xtend = require('xtend');

function Feed(url,pageSize,data) {
  xtend(this, data);
  this.baseUrl = url;
  this.pageSize = pageSize;
}

Feed.prototype.isLastPage = function() {

	//Linkedin doesn't return a count if all elements are in the result.
	if( typeof this._count === "undefined" )
		return true;

	return this._count < this.pageSize;
}

Feed.prototype.getNextLink = function() {
	if( !this.isLastPage() ){
		return this.baseUrl + "&start=" + (this._start + this._count).toString() + "&count=" + this.pageSize;
	}
}

module.exports = Feed;