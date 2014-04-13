/** @jsx React.DOM */

min_relevance = 0

function log(log_text) {
	var curr_time = new Date();
	var curr_time = curr_time.getHours() + ":" + curr_time.getMinutes() + ":" + curr_time.getSeconds();		
	log_entry = "<code>>> " + curr_time + ": " + log_text + "</code><br>"
	document.getElementById("console").innerHTML = document.getElementById("console").innerHTML  + log_entry
}
	

var Article = React.createClass({
	getInitialState: function() {
		return {prev_clicked:false, relevance:this.props.relevance, modified:false};
	},

	log: function(log_text) {
		var curr_time = new Date();
		var curr_time = curr_time.getHours() + ":" + curr_time.getMinutes() + ":" + curr_time.getSeconds();		
		log_entry = "<code>>> " + curr_time + ": " + log_text + "</code><br>"
		document.getElementById("console").innerHTML = document.getElementById("console").innerHTML  + log_entry
	},
	
	componentWillMount: function() {
	},
	
	handleChange: function(event) {
		if (!isNaN(event.target.value)) {
			this.setState({relevance: event.target.value});
			this.state.modified = true
		}
  	},

	componentDidMount: function() {
		document.getElementById("cover").className = "hide"

	},

	deleteArticle: function() {

		if (this.state.prev_clicked == false) {
			this.setState({prev_clicked:true})
			this.setState({prev_clicked:true})
			log("Deleted article <b>'" + this.props.title + "'</b> by <b>" + this.props.author + "</b>. Object id: " + this.props.obj_id)

		var http = new XMLHttpRequest();
		var del_url = "https://api.parse.com/1/classes/articles/" + this.props.obj_id;
		http.open("DELETE", del_url, true);
		http.setRequestHeader("X-Parse-Application-Id", "Uzki9qm4y0TtV5tON7nS3JMy0MVlVpCwWk8zmM3f");
		http.setRequestHeader("X-Parse-REST-API-Key", "unKRN6nyC3V4ynbmLq3lc3qwu81qSSVHOZ770ced");
		http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

		http.onreadystatechange = function() {
			if(http.readyState == 4 && http.status == 200) {
				console.log(http.responseText);
				console.log(http)
			}
		}
		http.send();
		} else {
			this.setState({prev_clicked:false})
		}
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
			console.log("modified")
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
						<i className="icon-large icon-trash" onClick={this.deleteArticle}></i>
						<i className="icon-large icon-ok-sign" onClick={this.deleteArticle}></i>
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
		nextprops = {min_relevance: parseInt(document.getElementById("min_relevance").value)}
		this.setProps(nextprops)
	},
	
	getInitialState: function() {
		return {data: []};
	},
	
	componentWillMount: function() {
		this.loadArticlesFromServer();
		setInterval(this.loadArticlesFromServer, this.props.pollInterval);

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

				<ArticleList data={this.state.data} min_relevance={this.props.min_relevance} />
      		</div>
    	);
  	}
});

var ArticleList = React.createClass({

	render: function() {
		var min = this.props.min_relevance
		var articleNodes = this.props.data.map(function (article, index) {
			return <Article key={index} author={article.author} title={article.title} relevance={article.relevance} min_relevance={min} obj_id={article.objectId}>{article.text}</Article>;
		});
		return <div className="articleList">{articleNodes}</div>;
  	}
});

var LoadingIndicator = React.createClass({
	render: function() {
		return 	<div id="cover"></div>;
  	}
});

var Console = React.createClass({
	render: function() {
		return 	<div id="console"><h2>Console</h2></div>
  	}
});

React.renderComponent(
	<ArticleBox url="/articles.json" pollInterval={2000} min_relevance={0}/>,
	document.getElementById('container')
);