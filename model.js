const Sequelize = require('sequelize')

//初始化数据库
const sequelize = new Sequelize('blog', null, null, {
    dialect: 'sqlite',
    storage: 'blog.db'
});

//定义数据模型
const Article = sequelize.define('article', {
    title: Sequelize.TEXT,
    summary: Sequelize.TEXT,
    content: Sequelize.TEXT,
});
const Tag = sequelize.define('tag', {
    name: Sequelize.STRING
});
const Category = sequelize.define('category', {
    name: Sequelize.STRING,
    title: Sequelize.STRING
});
const BlogComment = sequelize.define('comment', {
    content: Sequelize.TEXT,
    uid: Sequelize.STRING,
    uname: Sequelize.STRING
});

//建立模型间的关联
Article.belongsTo(Category);
BlogComment.belongsTo(Article);
Article.belongsToMany(Tag, { through: 'article2tag' });
Tag.belongsToMany(Article, { through: 'article2tag' });

//导出
exports.Article = Article;
exports.Tag = Tag;
exports.Category = Category;
exports.Comment = BlogComment;
exports.dbContext = sequelize;

//同步数据库
if (process.argv[2] == 'migrate') {
    //Sync database
    console.log('Syncing database')
    sequelize.sync().then(console.log('Database sync complete!'));
}