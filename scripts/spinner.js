/** @jsx React.DOM */

/*
The Spinner module contains a React class representing the loading spinner.
*/

var Spinner = React.createClass({
	render: function() {
		return <div id="spinner_cover"><img id="spinner" src="/img/spinner.gif"></img></div>;
  	}
});

