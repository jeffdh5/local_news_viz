var fs = require('fs');

var express = require('express');
var app = express();


app.use('/', express.static(__dirname));
app.use(express.bodyParser());

app.get('/articles.json', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(comments));
});

app.listen(process.env.PORT || 3000);
