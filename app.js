var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var pgp = require('pg-promise')()

var dbConn = {
    host: 'localhost',
    port: 5432,
    database: 'blog_database',
    user: 'blogger'
};

var conn = pgp(dbConn);

var productRoute = require('./routes/products');
var articlesRoute = require('./routes/articles');
var logger = require('./lib/middleware/logger');
var allowTracking = require('./lib/middleware/allowTracking');

var app = express();

app.set('view engine', 'jade');
app.set('views', './views');

app.use(express.static('./public'));
app.use(bodyParser.urlencoded({ extended : true }));

app.use(function(req, res, next) {
  req.conn = conn;
  next();
});

app.use(methodOverride(function(req, res){
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    var method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

app.use(allowTracking);
app.use(logger);

app.use('/products', productRoute);
app.use('/articles', articlesRoute);

app.use(function(req, res) {
  res.status(404).render('error/404');
});

if(!module.parent) {
  app.listen(3000);
}

module.exports = app;