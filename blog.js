const db = require('./model');
const api = require('./api');
const config = require('./config')
const Router = require('koa-router');
const marked = require('marked');

// 初始化路由
const router = new Router();

// 添加中间件，用于显示分类和标签列表
router.use(async(ctx, next) => {
    ctx.cates = await db.Category.findAll();
    ctx.tags = await db.Tag.findAll();
    await next();
})

// 文章列表
router.get('/', async ctx => {
    let page = parseInt(ctx.query.page);
    if (!page) { page = 1; }
    let result = await db.Article.findAndCountAll({
        order: 'createdAt DESC',
        include: [db.Category, db.Tag],
        offset: (page - 1) * config.perpage,
        limit: config.perpage
    });
    ctx.body = await ctx.render('blog', {
        title: "高尚的博客",
        articles: result.rows,
        pages: Math.ceil(result.count / config.perpage),
        cates: ctx.cates,
        tags: ctx.tags,
    });
});

// 某个标签的文章列表
router.get('/tag/:id', async ctx => {
    let page = parseInt(ctx.query.page);
    if (!page) { page = 1; }
    let tag = await db.Tag.findById(ctx.params.id);
    if (!tag) { ctx.redirect('/blog'); return; }
    let num = await tag.countArticles()
    let articles = await tag.getArticles({
        include: [{ model: db.Tag }],
        order: 'article.createdAt DESC',
        offset: (page - 1) * config.perpage,
        limit: config.perpage
    });
    ctx.body = await ctx.render('blog', {
        title: tag.name,
        sub_title: 'Tag',
        articles: articles,
        pages: Math.ceil(num / config.perpage),
        cates: ctx.cates,
        tags: ctx.tags,
    });
});

// 某个分类的文章列表
router.get('/cate/:name', async ctx => {
    let page = parseInt(ctx.query.page);
    if (!page) { page = 1; }
    let cate = await db.Category.findOne({ where: { name: ctx.params.name } });
    if (!cate) { ctx.redirect('/blog'); return; }
    let result = await db.Article.findAndCountAll({
        include: [db.Category, db.Tag],
        where: { categoryId: cate.id },
        offset: (page - 1) * config.perpage,
        limit: config.perpage
    });
    ctx.body = await ctx.render('blog', {
        title: cate.title,
        sub_title: 'Category',
        articles: result.rows,
        pages: Math.ceil(result.count / config.perpage),
        cates: ctx.cates,
        tags: ctx.tags,
    });
});

// 文章正文页
router.get('/articles/:id', async ctx => {
    let article = await db.Article.findOne({ where: { id: ctx.params.id } });
    if (!article) { ctx.redirect('/blog'); return; }
    ctx.body = await ctx.render('article', {
        article: article,
        article_content: marked(article.content),
        tags: ctx.tags,
        cates: ctx.cates,
    });
});

module.exports = router;