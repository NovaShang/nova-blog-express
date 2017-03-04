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

//Export models
exports.Article=Article;
exports.Tag=Tag;
exports.Category=Category;