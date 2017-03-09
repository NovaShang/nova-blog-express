var express = require("express");
var Sequelize = require("sequelize");
var marked = require('marked');

//====DataModel==========================

//Initialize ORM framework
var sequelize = new Sequelize('blog', null, null, {
    dialect: 'sqlite',
    storage: 'blog.db'
});

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
Article.belongsToMany(Tag, { through: 'article2tag' });
Tag.belongsToMany(Article, { through: 'article2tag' });

//====Router==============================
var blog = express.Router();
module.exports = blog;

blog.use(function(request, response, next) {
    Promise.all([
        Tag.findAll(),
        Category.findAll()
    ]).then(x => {
        request.tags = x[0];
        request.categories = x[1];
        next();
    });
});

// Blog index
blog.get('/', function(request, response) {
    Article.findAll({ include: [Tag] })
        .then(x => response.render('blog/blog.html', {
            title: 'BIM & Coding',
            sub_title: '高尚的博客',
            articles: x,
            tags: request.tags,
            cates: request.categories
        }));
});
// Index of a tag
blog.get('/tag/:id', function(request, response) {
    Tag.findById(request.params.id, { include: [Article] })
        .then(x => response.render('blog/blog.html', {
            title: x.name,
            sub_title: '标签',
            articles: x.articles,
            tags: request.tags,
            cates: request.categories
        }));
});
// Index of a category
blog.get('/cate/:name', function(request, response) {
    Article.findAll({
            include: [{
                model: Category,
                where: { name: request.params.name }
            }]
        })
        .then(x => response.render('blog/blog.html', {
            title: x.title,
            sub_title: '类别',
            articles: x,
            tags: request.tags,
            cates: request.categories
        }));
});
// Search result
blog.get('/search', function(request, response) {
    Article.findAll({
            where: { title: { $like: '%' + request.query.keyword + '%' } }
        })
        .then(x => response.render('blog/blog.html', {
            title: request.query.keyword,
            sub_title: '搜索结果',
            articles: x,
            tags: request.tags,
            cates: request.categories
        }));
});
// Blog editor
blog.get('/publish', function(request, response) {
    response.render('blog/publish.html');
});
// Article page
blog.get('/:id', function(request, response) {
    Article.findOne({
            where: { id: request.params.id }
        })
        .then(x => response.render('blog/article.html', {
            article: x,
            article_content: marked(x.content),
            tags: request.tags,
            cates: request.categories
        }));
});
// Publish article
blog.post('/api/publish', function(request, response) {
    var article;
    Promise.all([
            Promise.all(
                request.body.tags.map(
                    x => Tag.findOne({ where: { name: x } })
                )),
            Promise.all([
                Article.create({
                    title: request.body.title,
                    summary: request.body.summary,
                    content: request.body.content
                })
                .then(x => article = x),
                Category.findOne({
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
blog.get('/api/tags', function(request, response) {
    response.json(request.tags)
});
// Add a tag
blog.post('/api/tags', function(request, response) {
    Tag.create({ name: request.body.name })
        .then(x => response.json({
            result: "success",
            url: ""
        }), x => response.json(x));
});
// Get categories
blog.get('/api/categories', function(request, response) {
    response.json(request.Categories)
});
// Add a category
blog.post('/api/categories', function(request, response) {
    Category.create({
            name: request.body.name,
            title: request.body.title
        })
        .then(x => response.json({
            result: "success",
            url: ""
        }), x => response.json(x));
});