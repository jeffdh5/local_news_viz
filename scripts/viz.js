/** @jsx React.DOM */


function log(log_text) {
	var curr_time = new Date();
	var curr_time = curr_time.getHours() + ":" + curr_time.getMinutes() + ":" + curr_time.getSeconds();		
	log_entry = ">>> " + curr_time + ": " + log_text
	log_list.push(log_entry)
}

json_list = []
log_list = []

url = "https://api.parse.com/1/classes/articles"

//initial ajax request for articles
var xhr = new XMLHttpRequest();

function reqListener () {
	var results = JSON.parse(this.responseText)["results"];
	for (var c=0; c<results.length; c++) {
		json_list.push(results[c])
	}
}

xhr.onload = reqListener;
xhr.open("GET", url, true);
xhr.setRequestHeader("X-Parse-Application-Id", "Uzki9qm4y0TtV5tON7nS3JMy0MVlVpCwWk8zmM3f");
xhr.setRequestHeader("X-Parse-REST-API-Key", "unKRN6nyC3V4ynbmLq3lc3qwu81qSSVHOZ770ced");
xhr.setRequestHeader("Content-Type", "application/json");

xhr.send();





var Article = React.createClass({
	getInitialState: function() {
		return {prev_clicked:false, relevance:this.props.relevance, modified:false};
	},
	
	componentWillMount: function() {
	},
	
	handleChange: function(event) {
		if (!isNaN(event.target.value)) {
			this.setState({relevance: event.target.value});
			this.state.modified = true
			console.log("at handlechange")
		}
  	},

	componentDidMount: function() {
		document.getElementById("cover").className = "hide"

	},

	forceArticleboxRefresh: function() {
		nextProps = {trigger: true}
		this.props.parentthis.setProps(nextProps)
	},

	saveChange: function() {
		log("Saved change at '" + this.props.title + "' by " + this.props.author + ". Object id: " + this.props.obj_id)
		var http = new XMLHttpRequest();
		var save_url = "https://api.parse.com/1/classes/articles/" + this.props.obj_id;
		http.open("PUT", save_url, true);
		http.setRequestHeader("X-Parse-Application-Id", "Uzki9qm4y0TtV5tON7nS3JMy0MVlVpCwWk8zmM3f");
		http.setRequestHeader("X-Parse-REST-API-Key", "unKRN6nyC3V4ynbmLq3lc3qwu81qSSVHOZ770ced");
		http.setRequestHeader("Content-type", "application/json");
		score_data = []
		score_data.push(this.state.relevance)
		data = JSON.stringify({"relevance": score_data})
		http.send(data);
	},

	deleteArticle: function() {

		log("Deleted article '" + this.props.title + "' by " + this.props.author + ". Object id: " + this.props.obj_id)

		var http = new XMLHttpRequest();
		var del_url = "https://api.parse.com/1/classes/articles/" + this.props.obj_id;
		http.open("DELETE", del_url, true);
		http.setRequestHeader("X-Parse-Application-Id", "Uzki9qm4y0TtV5tON7nS3JMy0MVlVpCwWk8zmM3f");
		http.setRequestHeader("X-Parse-REST-API-Key", "unKRN6nyC3V4ynbmLq3lc3qwu81qSSVHOZ770ced");
		http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		http.send();
		delete json_list[this.props.key]
		this.forceArticleboxRefresh();
	},
	
	selectArticle: function() {		
		if (this.state.prev_clicked == false) {
			this.setState({prev_clicked:true})
			this.setState({prev_clicked:true})			
		} else {
			this.setState({prev_clicked:false})
		}
	},
	
	render: function() {		
		if (this.state.modified == true) {
			//console.log("modified")
		}
		var rawMarkup = (this.props.children);
		if (this.state.prev_clicked == false) {
			var className="article"
		} else {
			var className="article-clicked"
		}	

		var relevance = this.state.relevance;

		if (this.props.relevance >= this.props.min_relevance) {
			return (
				<div className="article-container">
					<div className={className} onClick={this.selectArticle}>
						<h2 className="articleTitle">{this.props.title}</h2>
						<h4 className="articleAuthor">{this.props.author}</h4>
						<p dangerouslySetInnerHTML={{__html: rawMarkup}} />
					</div>
					<div className="article-bottom">
						<label>Relevance: <input type="text" value={relevance} onChange={this.handleChange} /></label>
						<i className="fa fa-save fa-2x" onClick={this.saveChange}></i>
						<i className="fa fa-trash-o fa-2x" onClick={this.deleteArticle}></i>

					</div>
				</div>
			);
		} else {
			return (
			<div></div>
			);
		}
	}
});


var ArticleBox = React.createClass({

	loadArticlesFromServer: function() {
		this.setState({data: json_list, recompute:false})
	},
	
	recompute: function() {
		min_relevance = parseInt(document.getElementById("min_relevance").value)
		if (this.props.min_relevance != min_relevance) {
			log("Changed minimum score to " + min_relevance)
			nextprops = {min_relevance: min_relevance}
			this.setProps(nextprops)
		}
	},
	
	getInitialState: function() {
		return {data: []};
	},
	
	componentWillMount: function() {
		this.loadArticlesFromServer();
		setInterval(this.loadArticlesFromServer, this.props.pollInterval);
	},

	componentWillReceiveProps: function(nextProps) {
		console.log(nextProps)
	},

	componentDidMount: function() {
		this.loadArticlesFromServer();
	},
		
	render: function() {
		return (
			<div className="articleBox">
				<h1>Local News Database</h1>
				<div className="spec">
					<div className="spec-left">
						<h3>Database: Marin Independent Journal, Lexis Nexis</h3>
						<h4>Query Term: San Francisco</h4>
					</div>
					<div className="spec-right">
						<h3>Search By Relevance</h3>
						<label>Minimum Relevance: </label><input type="text" id="min_relevance"></input>
						<button className="recompute" onClick={this.recompute}>Recompute</button>
					</div>
				</div>
				<Console />
				<LoadingIndicator />

				<ArticleList data={this.state.data} min_relevance={this.props.min_relevance} parent_this = {this} />
      		</div>
    	);
  	}
});

var ArticleList = React.createClass({

	render: function() {
		var min = this.props.min_relevance
		var parentthis = this.props.parent_this
		//console.log(parentthis)
		var articleNodes = this.props.data.map(function (article, index) {
			return <Article parentthis = {parentthis} key={index} author={article.author} title={article.title} relevance={article.relevance} min_relevance={min} obj_id={article.objectId}>{article.text}</Article>;
		});
		return <div className="articleList">{articleNodes}</div>;
  	}
});

var LoadingIndicator = React.createClass({
	render: function() {
		return 	<div id="cover"><img id="loader" src="/img/indicator.gif"></img></div>;
  	}
});

var Console = React.createClass({
	render: function() {
 		var logNodes = log_list.map(function (log, index) {
 			return (
 				<code>{log}<br></br>
 				</code>
 			)
  		});
  		return (
  			<div id="console">
  				<h2>Console</h2>
  				<code> >>> Console loaded.<br></br></code>
  				{logNodes}<br></br>
  			</div>
  		)
  	}
});

React.renderComponent(
	<ArticleBox url="/articles.json" pollInterval={2000} min_relevance={0} trigger={false}/>,
	document.getElementById('container')
);