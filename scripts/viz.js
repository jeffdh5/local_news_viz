/** @jsx React.DOM */

min_relevance = 0

var Article = React.createClass({
	getInitialState: function() {
		return {prev_clicked:false};
	},

	deleteArticle: function() {

		if (this.state.prev_clicked == false) {
			this.setState({prev_clicked:true})
			this.setState({prev_clicked:true})
			//delete database[this.props.key]
			console.log("Deleted article at index " + this.props.key)
			
			var db = Parse.Object.extend("articles")
			//var query = new Parse.Query(db)
			//query.equalTo("title", this.props.title)
			//console.log(query)
			//query.first({
  			//	success: function(object) {
    		//	// Successfully retrieved the object.
    		//	console.log(object)
  			//},
  			//error: function(error) {
    		//	alert("Error: " + error.code + " " + error.message);
  			//}
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
		var rawMarkup = (this.props.children);
		if (this.state.prev_clicked == false) {
			var className="article"
		} else {
			var className="article-clicked"
		}	
		
		if (this.props.relevance >= min_relevance) {
			return (
				<div className="article-container">
					<div className={className} onClick={this.selectArticle}>
						<h2 className="articleTitle">{this.props.title}</h2>
						<h4 className="articleAuthor">{this.props.author}</h4>
						<p dangerouslySetInnerHTML={{__html: rawMarkup}} />
					</div>
					<div className="article-bottom">
						<label>Relevance: {this.props.relevance}</label>
						<i className="icon-large icon-trash" onClick={this.deleteArticle}></i>
					</div>
				</div>
			);
		} else {
			return (
			<div>
			</div>
			);
		}
	}
});


var ArticleBox = React.createClass({
	loadArticlesFromServer: function() {
		//target = this
		//var http_request = new XMLHttpRequest();
		//http_request.open("GET", this.props.url, true);
		//http_request.onreadystatechange = function() {
		//	var done=4;
		//	var ok = 200;
		//	if (http_request.readyState === done && http_request.status === ok){
		//		database = JSON.parse(http_request.responseText)
		//		target.setState({data: JSON.parse(http_request.responseText)});
		//		//console.log(target.state.data)
		//		console.log(JSON.parse(http_request.responseText))
		//	}
		//};
		//http_request.send();
		this.setState({data: json_list})
	},
	
	recompute: function() {
		min_relevance = parseInt(document.getElementById("min_relevance").value)
	},
	
	getInitialState: function() {
		return {data: []};
	},
	
	componentWillMount: function() {
		this.loadArticlesFromServer();
		setInterval(this.loadArticlesFromServer, this.props.pollInterval);
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
						<label>Minimum Relevance: </label><input type="text" id="min_relevance"></input>
						<button className="recompute" onClick={this.recompute}>Recompute</button>
					</div>
				</div>
				<ArticleList data={this.state.data} />
      		</div>
    	);
  	}
});

var ArticleList = React.createClass({
	render: function() {
		var articleNodes = this.props.data.map(function (article, index) {
			return <Article key={index} author={article.author} title={article.title} relevance={article.relevance}>{article.text}</Article>;
		});
		return <div className="articleList">{articleNodes}</div>;
  	}
});


React.renderComponent(
	<ArticleBox url="/articles.json" pollInterval={2000} />,
	document.getElementById('container')
);
