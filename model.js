const Sequelize = require('sequelize')

//初始化数据库
const sequelize = new Sequelize('blog', null, null, {
    dialect: 'sqlite',
    storage: 'blog.db'
});

//定义数据模型
const Article = sequelize.define('article', {
    title: Sequelize.STRING,
    summary: Sequelize.TEXT,
    content: Sequelize.TEXT,
    count: Sequelize.INTEGER,
    thumb: Sequelize.STRING,
    hidden: Sequelize.BOOLEAN,
    public: Sequelize.BOOLEAN
});
const Tag = sequelize.define('tag', {
    name: Sequelize.STRING
});
const Category = sequelize.define('category', {
    name: Sequelize.STRING,
    title: Sequelize.STRING,
    thumb: Sequelize.STRING
});
const BlogComment = sequelize.define('comment', {
    content: Sequelize.TEXT,
    email: Sequelize.STRING,
    uname: Sequelize.STRING,
    hidden: Sequelize.BOOLEAN
});
const Work = sequelize.define('work', {
    name: Sequelize.STRING,
    summary: Sequelize.TEXT,
    giturl: Sequelize.STRING,
    projecturl: Sequelize.STRING,
    version: Sequelize.STRING,
    hidden: Sequelize.BOOLEAN,
    content: Sequelize.TEXT,
});
const Tech = sequelize.define('tech', {
    name: Sequelize.STRING
});

//建立模型间的关联
Article.belongsTo(Category);
Category.hasMany(Article);
Article.hasMany(BlogComment);
Article.belongsToMany(Tag, { through: 'article2tag' });
Tag.belongsToMany(Article, { through: 'article2tag' });
Work.belongsToMany(Tech, { through: 'work2tech' });
Tech.belongsToMany(Work, { through: 'work2tech' });

//导出
exports.Article = Article;
exports.Tag = Tag;
exports.Category = Category;
exports.Comment = BlogComment;
exports.Work = Work;
exports.Tech = Tech;
exports.dbContext = sequelize;

//同步数据库
if (process.argv[2] == 'migrate') {
    //Sync database
    console.log('Syncing database');
    sequelize.sync().then(() => { console.log('Database sync complete!') }, () => {
        console.log('Database sync Failed!')
    });
}