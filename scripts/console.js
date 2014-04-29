/** @jsx React.DOM */

/*
The Console module contains a React class and a global function for logging. 
*/

function log(log_text) {
	//Global function used for logging in the web console.
	
	var curr_time = new Date();
	var curr_time = curr_time.getHours() + ":" + curr_time.getMinutes() + ":" + curr_time.getSeconds();		
	log_entry = ">>> " + curr_time + ": " + log_text
	log_list.push(log_entry)
}

var Console = React.createClass({
	render: function() {
 		var logNodes = log_list.map(function (log, index) {
 			return <code key={index}>{log}<br></br></code>;
  		});
  		return (
  			<div id="console">
  				<h2>Console</h2>
  				<code> >>> Console loaded.<br></br></code>
  				{logNodes}
  				<br></br>
  			</div>
  		)
  	}
});