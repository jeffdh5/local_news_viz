/** @jsx React.DOM */


/*
articles.js handles the main web layout. Console and Spinner modules are defined separately
because their functionalities is more general and can be extended elsewhere.

Abstraction
From a high-level perspective, there are three types of objects that represent the main
layout of the page: ArticleBox, ArticleList, and Article. ArticleBox contains the entire
page layout except for the footer. We use ArticleBox to deal with variables that
affect all of the individual Article objects.

ArticleList contains a list of articles, represented by grids. Each Article grid contains
the key information of the article as well as a delete button, and a save button for
editing minimum relevance.
*/

var ArticleBox = React.createClass({
	/*ArticleBox is the div element containing the entire page layout, including
	the spec boxes at the top of the page, and an ArticleList object. 
	
	Props-
	1) min_relevance: Float element, which determines the minimum value for an article to be 
	displayed. This prop is bubbled down to ArticleList and Article.
	
	2) trigger: Boolean that is passed down to ArticleList and Article. Initialized as false, 
	changed to true when an article is modified, and needs to immediately force the ArticleBox
	to re-render.*/
	
	getInitialState: function() {
		return {data: []};
	},
	
	componentWillMount: function() {
		this.loadArticlesFromServer();
		setInterval(this.loadArticlesFromServer, this.props.pollInterval);
	},

	loadArticlesFromServer: function() {
		//updates article_list, and modifies this.state.data to have the newest article_list
		
		call_parse_api("GET", url, "", xhr)
		this.setState({data: article_list, recompute:false})
	},
	
	recompute: function() {
		//Updates ArticleBox's min_relevance prop with new user inputted min_relevance,
		//which triggers ArticleBox's render function.
		
		min_relevance = parseFloat(document.getElementById("min_relevance").value)
		if (this.props.min_relevance != min_relevance) {
			log("Changed minimum score to " + min_relevance)
			nextprops = {min_relevance: min_relevance}
			this.setProps(nextprops)
		}
	},
	
	render: function() {
		return (
			<div className="articleBox">
				<h1>Local News Database</h1>
				<div className="spec">
					<div className="spec-left">
						<h3>Database: {database_name}</h3>
						<h4>Query Term: {query_term}</h4>
					</div>
					<div className="spec-right">
						<h3>Search By Relevance</h3>
						<label>Minimum Relevance: </label><input type="text" id="min_relevance"></input>
						<button className="recompute" onClick={this.recompute}>Recompute</button>
					</div>
				</div>
				<Console />
				<Spinner />

				<ArticleList data={this.state.data} min_relevance={this.props.min_relevance} parent_this ={this} />
      		</div>
    	);
  	}
});

var ArticleList = React.createClass({
	/*ArticleList is the div element containing a list of Article objects.
	*/
	
	render: function() {
		var min = this.props.min_relevance
		var parentthis = this.props.parent_this
		var articleNodes = this.props.data.map(function (article, index) {
			return <Article key={index} parentthis={parentthis} author={article.author} title={article.title} relevance={article.relevance} min_relevance={min} obj_id={article.objectId}>{article.text}</Article>;
		});
		return <div className="articleList">{articleNodes}</div>;
  	}
});

var Article = React.createClass({
	/*
	Article is a div element corresponding to an article grid. Article contains information
	such as title, byline, article text, and relevance score.
	
	Props-
	1) key: unique index in page layout, required by react.js
	2) parentthis: ArticleBox's props bubbled down. Used when an Article gets deleted or somehow
	changed and ArticleBox needs to re-render the list of articles.
	3) author: String representing the byline of the article.
	4) title: String representing title of article.
	5) relevance: Float representing relevance score.
	6) min_relevance: Bubbled down from ArticleBox. Article's render function will return null
	if relevance < min_relevance, or a div element of relevance >= min_relevance.
	7) obj_id: ID of the object in relation to the Parse database.
	*/

	getInitialState: function() {
		return {prev_clicked:false, modified:false, relevance:this.props.relevance};
	},

	componentDidMount: function() {
		document.getElementById("spinner_cover").className = "hide" //hide spinner
	},	

	forceArticleboxRefresh: function() { 
		//trigger articleBox's re-render function
		nextProps = {trigger: true}
		this.props.parentthis.setProps(nextProps)
	},
	
	updateRelevanceScore: function(event) {
		//Updates state as user modifies the textbox, so that the relevance value
		//found in an article instance's state will always be the most updated value.		

		//this function does NOT save to Parse API database - see saveChange()

		if (!isNaN(event.target.value)) {
			this.setState({relevance: event.target.value});
			this.state.modified = true
		}
  	},

	saveChange: function() { 
		//Saves changes to Parse API database.
		
		log("Attempted change at '" + this.props.title + "' by " + this.props.author + ". Object id: " + this.props.obj_id)
		var	score_data = []
		score_data.push(this.state.relevance)
		data = JSON.stringify({"relevance": score_data})
		call_parse_api("PUT", url + "/" + this.props.obj_id, data, xhr)
		log("Saved change at '" + this.props.title + "' by " + this.props.author + ". Object id: " + this.props.obj_id)
	},

	deleteArticle: function() {
		//Deletes changes to Parse API database.
		//Note that the article_list is not re-loaded from the Parse database; it is modified
		//locally through article_list for optimistic updating.
		
		log("Deleted article '" + this.props.title + "' by " + this.props.author + ". Object id: " + this.props.obj_id)
		call_parse_api("DELETE", url + "/" + this.props.obj_id, "", xhr)
		delete article_list[this.props.key]
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
			this.setState({modified:false})
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
						<label>Relevance: <input type="text" value={relevance} onChange={this.updateRelevanceScore} /></label>
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

React.renderComponent(
	<ArticleBox pollInterval={2000} min_relevance={0} trigger={false}/>,
	document.getElementById('container')
);