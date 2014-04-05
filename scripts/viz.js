/** @jsx React.DOM */

var previously_clicked = {}

var Article = React.createClass({
	getInitialState: function() {
		return {prev_clicked:false};
	},

	onClick: function() {
		if (this.state.prev_clicked == false) {
			this.setState({prev_clicked:true})
		} else {
			this.setState({prev_clicked:false})
		}
	},
	
	render: function() {
		var rawMarkup = (this.props.children).substring(0, 300) + "...";
		if (this.state.prev_clicked == false) {
			var className="article"
		} else {
			var className="article-clicked"
		}		
		return (
			<div className={className} onClick={this.onClick}>
				<h2 className="articleTitle">{this.props.title.substring(0,100)}</h2>
				<h4 className="articleAuthor">{this.props.author}</h4>
				<p dangerouslySetInnerHTML={{__html: rawMarkup}} />
			</div>
		);
	}
});

var ArticleBox = React.createClass({
	loadArticlesFromServer: function() {
		target = this
		var http_request = new XMLHttpRequest();
		http_request.open("GET", this.props.url, true);
		http_request.onreadystatechange = function() {
			var done=4;
			var ok = 200;
			if (http_request.readyState === done && http_request.status === ok){
				target.setState({data: JSON.parse(http_request.responseText)});
			}
		};
		http_request.send();
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
				<h1>Articles</h1>
				<ArticleList data={this.state.data} />
      	</div>
    	);
  	}
});

var ArticleList = React.createClass({
	render: function() {
		var articleNodes = this.props.data.map(function (article, index) {
			return <Article key={index} author={article.author} title={article.title}>{article.text}</Article>;
		});
		return <div className="articleList">{articleNodes}</div>;
  	}
});


React.renderComponent(
	<ArticleBox url="/articles.json" pollInterval={2000} />,
	document.getElementById('container')
);
