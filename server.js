// Import required packages
var express = require('express');
var swig = require('swig');
var bodyparser = require('body-parser');
var marked = require('marked');
var favicon = require('serve-favicon');
var path = require('path');
// Import other modules
var blog = require('./blog');
//===========================WebServer===========================

//Initialize and setup web framework
var app = express();
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.use(favicon(path.join(__dirname, 'static', 'favicon.ico')));
app.use('/static', express.static('static'));
app.use(bodyparser());
app.use(function(request, response, next) {
    response.header("Access-Control-Allow-Origin", '*');
    response.header("Access-Control-Allow-Headers", "X-Requested-With");
    response.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    next();
});

app.use('/blog',blog);

// Pages
// Home page
app.get('/', function(request, response) {
    response.render('home.html');
});

// About page
app.get('/about', function(request, response) {
    response.json({
        asdf: "asdfasfd"
    });
});
// Portfolio page
app.get('/portfolio', function(request, response) {
    response.render('portfolio.html');
});

// API


//===============================Run==============================

if (process.argv[2] == 'migrate') {
    //Sync database
    console.log('Syncing database')
    sequelize.sync().then(console.log('Database sync complete!'));
} else if (process.argv[2] == 'runserver') {
    app.listen(80);

} else {
    // Run server
    app.listen(8000);
}