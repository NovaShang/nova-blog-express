var express = require("express");
var Sequelize=require("sequelize")


//============================DataModel==========================

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



var blog = express.Router();
module.exports=blog;

// Blog index
blog.get('/blog', function(request, response) {
    Promise.all([
            Article.findAll({ include: [Tag] }),
            Tag.findAll(),
            Category.findAll()
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
blog.get('/blog/tag/:id', function(request, response) {
    Promise.all([
            Tag.findById(request.params.id, { include: [Article] }),
            Tag.findAll(),
            Category.findAll()
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
blog.get('/blog/cate/:name', function(request, response) {
    Promise.all([
            Article.findAll({
                include: [{
                    model: Category,
                    where: { name: request.params.name }
                }]
            }),
            Tag.findAll(),
            Category.findAll()
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
blog.get('/blog/search', function(request, response) {
    Promise.all([
            Article.findAll({
                where: { title: { $like: '%' + request.query.keyword + '%' } }
            }),
            Tag.findAll(),
            Category.findAll()
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
blog.get('/blog/publish', function(request, response) {
    response.render('publish.html');
});
// Article page
blog.get('/blog/:id', function(request, response) {
    Promise.all([
            Article.findOne({
                where: { id: request.params.id }
            }),
            Tag.findAll(),
            Category.findAll()
        ])
        .then(x => response.render('article.html', {
            article: x[0],
            article_content: marked(x[0].content),
            tags: x[1],
            cates: x[2]
        }));
});

// Publish article
blog.post('/api/blog/publish', function(request, response) {
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
blog.get('/api/blog/tags', function(request, response) {
    Tag.findAll()
        .then(x => response.json(x))
});
// Add a tag
blog.post('/api/blog/tags', function(request, response) {
    Tag.create({ name: request.body.name })
        .then(x => response.json({
            result: "success",
            url: ""
        }), x => response.json(x));
});
// Get categories
blog.get('/api/blog/categories', function(request, response) {
    Category.findAll().then(x => response.json(x))
});
// Add a category
blog.post('/api/blog/categories', function(request, response) {
    Category.create({
            name: request.body.name,
            title: request.body.title
        })
        .then(x => response.json({
            result: "success",
            url: ""
        }), x => response.json(x));
});