// Import required packages
var express = require('express');
var Sequelize = require('sequelize');
var swig = require('swig');
var bodyparser = require('body-parser');
var repl = require('repl');
//============================DataModel==========================
//Initialize ORM framework
var sequelize = new Sequelize('blog', null, null, { dialect: 'sqlite', storage: 'blog.db' });
//Define data models
var Article = sequelize.define('article', {
    title: Sequelize.TEXT,
    summary: Sequelize.TEXT,
    content: Sequelize.TEXT,
});
var Tag = sequelize.define('tag', {
    name: Sequelize.STRING
});
var Category = sequelize.define('category', {
    name: Sequelize.STRING,
    title: Sequelize.STRING
});
//Build assosiation relationship between models
Article.belongsTo(Category);
//===========================WebServer===========================
//Initialize and setup web framework
var app = express();
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.use('/static', express.static('static'));
app.use(bodyparser())
    // Routers
app.get('/', function(request, response) {
    response.render('home.html');
});
app.get('/blog', function(request, response) {
    response.render('blog.html', {
        title: 'BIM & Coding',
        sub_title: '高尚的博客',
    });
});
app.get('/blog/publish', function(request, response) {
    response.render('publish.html', { cates: Category.findAll() });
});
app.post('/api/blog/publish', function(request, response) {
    Promise.all([
            Article.create({ title: request.body.title, summary: request.body.summary, content: request.body.content }),
            Category.findById(request.body.cate_id)
        ])
        .then(x => x[0].setCategory(x[1]), x => response.json({ result: "failed", message: x[0] + x[1] }))
        .then(() => response.json({ result: "success", url: "/blog/" }), x => response.json(x));
});
app.get('/api/blog/tags', function(request, response) {
    Tag.findAll().then(x => response.json(x))
});
app.post('/api/blog/tags', function(request, response) {
    Tag.create({ name: request.body.name })
        .then(x => response.json({ result: "success", url: "" }), x => response.json(x));
});
app.get('/api/blog/categories', function(request, response) {
    Category.findAll().then(x => response.json(x))
});
app.post('/api/blog/categories', function(request, response) {
    Category.create({ name: request.body.name })
        .then(x => response.json({ result: "success", url: "" }), x => response.json(x));
});
app.get('/blog/:id', function(request, response) {
    response.render('article.html');
});
app.get('/blog/tag/:id', function(request, response) {
    response.render('blog.html');
});
app.get('/blog/cate/:name', function(request, response) {
    response.render('blog.html');
});
app.get('/about', function(request, response) {
    response.json({ asdf: "asdfasfd" });
});
app.get('/portfolio', function(request, response) {
    response.render('portfolio.html');
});
//===============================Run==============================
if (process.argv[2] == 'migrate') {
    //Sync database
    console.log('Syncing database')
    sequelize.sync().then(console.log('Database sync complete!'));
} else {
    // Run server
    app.listen(8000);
}