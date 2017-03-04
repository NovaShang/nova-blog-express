// Import required packages
var express = require('express');
var models = require('./models');
var swig = require('swig');
var bodyparser = require('body-parser');
var marked = require('marked');

//===========================WebServer===========================

//Initialize and setup web framework
var app = express();
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.use('/static', express.static('static'));
app.use(bodyparser());
app.use(function(request, response, next) {
    response.header("Access-Control-Allow-Origin", '*');
    response.header("Access-Control-Allow-Headers", "X-Requested-With");
    response.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    next();
})

// Pages
// Home page
app.get('/', function(request, response) {
    response.render('home.html');
});
// Blog index
app.get('/blog', function(request, response) {
    Promise.all([
            models.Article.findAll({ include: [models.Tag] }),
            models.Tag.findAll(),
            models.Category.findAll()
        ])
        .then(x => response.render('blog.html', {
            title: 'BIM & Coding',
            sub_title: '高尚的博客',
            articles: x[0],
            tags: x[1],
            cates: x[2]
        }));
});
// Index of a tag
app.get('/blog/tag/:id', function(request, response) {
    Promise.all([
            models.Tag.findById(request.params.id, { include: [models.Article] }),
            models.Tag.findAll(),
            models.Category.findAll()
        ])
        .then(x => response.render('blog.html', {
            title: x[0].name,
            sub_title: '标签',
            articles: x[0].articles,
            tags: x[1],
            cates: x[2]
        }));
});
// Index of a category
app.get('/blog/cate/:name', function(request, response) {
    Promise.all([
            models.Article.findAll({
                include: [{
                    model: models.Category,
                    where: { name: request.params.name }
                }]
            }),
            models.Tag.findAll(),
            models.Category.findAll()
        ])
        .then(x => response.render('blog.html', {
            title: x[0].title,
            sub_title: '类别',
            articles: x[0],
            tags: x[1],
            cates: x[2]
        }));
});
// Search result
app.get('/blog/search', function(request, response) {
    Promise.all([
            models.Article.findAll({
                where: { title: { $like: '%' + request.query.keyword + '%' } }
            }),
            models.Tag.findAll(),
            models.Category.findAll()
        ])
        .then(x => response.render('blog.html', {
            title: request.query.keyword,
            sub_title: '搜索结果',
            articles: x[0],
            tags: x[1],
            cates: x[2]
        }));
});
// Blog editor
app.get('/blog/publish', function(request, response) {
    response.render('publish.html');
});
// Article page
app.get('/blog/:id', function(request, response) {
    Promise.all([
            models.Article.findOne({
                where: { id: request.params.id }
            }),
            models.Tag.findAll(),
            models.Category.findAll()
        ])
        .then(x => response.render('article.html', {
            article: x[0],
            article_content: marked(x[0].content),
            tags: x[1],
            cates: x[2]
        }));
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
// Publish article
app.post('/api/blog/publish', function(request, response) {
    var article;
    Promise.all([
            Promise.all(
                request.body.tags.map(
                    x => models.Tag.findOne({ where: { name: x } })
                )),
            Promise.all([
                models.Article.create({
                    title: request.body.title,
                    summary: request.body.summary,
                    content: request.body.content
                })
                .then(x => article = x),
                models.Category.findOne({
                    where: { name: request.body.cate }
                })
            ])
            .then(
                x => article.setCategory(x[1]),
                x => response.json({
                    result: "failed",
                    message: x[0] + x[1]
                })),
        ])
        .then(x => article.setTags(x[0]),
            x => response.json({
                result: "failed",
                message: x[0] + x[1]
            }))
        .then(() => response.json({
            result: "success",
            url: "/blog/" + article.id
        }), x => response.json(x));
});
// Get tags
app.get('/api/blog/tags', function(request, response) {
    models.Tag.findAll()
        .then(x => response.json(x))
});
// Add a tag
app.post('/api/blog/tags', function(request, response) {
    models.Tag.create({ name: request.body.name })
        .then(x => response.json({
            result: "success",
            url: ""
        }), x => response.json(x));
});
// Get categories
app.get('/api/blog/categories', function(request, response) {
    models.Category.findAll().then(x => response.json(x))
});
// Add a category
app.post('/api/blog/categories', function(request, response) {
    models.Category.create({
            name: request.body.name,
            title: request.body.title
        })
        .then(x => response.json({
            result: "success",
            url: ""
        }), x => response.json(x));
});

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