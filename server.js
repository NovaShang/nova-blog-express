// Import required packages
var express = require('express');
var Sequelize = require('sequelize');
var swig = require('swig');

//============================DataModel========================
//Initialize ORM framework
var sequelize = new Sequelize('blog', null, null, { dialect: 'sqlite', storage: 'blog.db' });
//Define data models
var Article = sequelize.define('article', {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    title: Sequelize.TEXT,
    summary: Sequelize.TEXT,
    content: Sequelize.TEXT,
});
var Tag = sequelize.define('tag', {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    name: Sequelize.STRING
});
var Category = sequelize.define('category', {
    name: Sequelize.STRING,
    title: Sequelize.STRING
});
//Build assosiation relationship between models
Article.belongsTo(Category);

//===========================WebServer==========================
//Initialize and setup web framework
var app = express();
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.use('/static', express.static('static'));
// Routers
app.get('/', function (request, response) {
    response.render('home.html');
});
app.get('/blog', function (request, response) {
    response.render('blog.html', {
        title: 'BIM & Coding',
        sub_title: '高尚的博客',
    });
});
app.get('/blog/publish', function (request, response) {
    response.render('publish.html');
});
app.get('/blog/:id', function (request, response) {
    response.render('article.html');
});
app.get('/blog/tag/:id', function (request, response) {
    response.render('blog.html');
});
app.get('/blog/cate/:name', function (request, response) {
    response.render('blog.html');
});
app.get('/about', function (request, response) {
    response.render('about.html');
});
app.get('/portfolio', function (request, response) {
    response.render('portfolio.html');
});

//=============================Run==============================
if (process.argv[2] == 'migrate') {
    //Sync database
    console.log('Syncing database')
    sequelize.sync().then(
        console.log('Database sync complete!')
    );
} else {
    // Run server
    app.listen(8000);
}