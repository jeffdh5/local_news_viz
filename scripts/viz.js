/** @jsx React.DOM */

var previously_clicked = {}

var Article = React.createClass({
  render: function() {
    var rawMarkup = (this.props.children).substring(0, 300) + "...";
    return (
      <div className="article" class="article">
        <h2 className="articleTitle">{this.props.title.substring(0,100)}</h2>
        <h4 className="articleAuthor">{this.props.author}</h4>
        <p dangerouslySetInnerHTML={{__html: rawMarkup}} />
      </div>
    );
  }
});

var ArticleBox = React.createClass({
  loadArticlesFromServer: function() {
    $.ajax({
      url: this.props.url,
      success: function(data) {
        this.setState({data: data});
      }.bind(this)
    });
  },
  onClick: function(event) {
  	
  	target = event.target
  	if (target.tagName != "DIV") {
  		target = target.parentNode  		
  	}
  
  	if (previously_clicked[target.getAttribute("data-reactid")]) {
  		console.log("Has been clicked before")
	  	target.style.backgroundColor = "white"  
	  	target.style.borderColor = "#ccc"
	  	delete previously_clicked[target.getAttribute("data-reactid")]
  	}
  	else {
		var lst_to_use = [target.getElementsByClassName("articleAuthor")[0].innerText, target.getElementsByClassName("articleTitle")[0].innerText]
		previously_clicked[target.getAttribute("data-reactid")] = lst_to_use	
		target.style.backgroundColor="#eee"  
	  	target.style.borderColor = "black"
  	}
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
      <div className="articleBox" onClick={this.onClick}>
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
