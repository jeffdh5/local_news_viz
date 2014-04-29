//Script to load articles from Parse API on page load.

function loadArticles () {
	//load articles from Parse API only on page load.
	//keeps articles updated internally to effectively cache a large amount of data.
	if (article_list.length == 0) {
		var results = JSON.parse(this.responseText)["results"];
		for (var c=0; c<results.length; c++) {
			article_list.push(results[c])
		}
	}
}

function call_parse_api (req_type, req_url, data, xhr_object) {
	xhr.open(req_type, req_url, true);
	xhr.setRequestHeader("X-Parse-Application-Id", parse_app_id);
	xhr.setRequestHeader("X-Parse-REST-API-Key", parse_rest_api_key);
	xhr.setRequestHeader("Content-Type", "application/json");
	if (req_type == "PUT") {
		xhr.send(data)
	} else {
		xhr.send()
	}
}

//initialize an XMLHttpRequest instance. This will be reused for any Parse API calls.
var xhr = new XMLHttpRequest();
xhr.onload = loadArticles;
