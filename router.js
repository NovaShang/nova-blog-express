const db = require('./model');
const api = require('./api');
const config = require('./config');
const Router = require('koa-router');
const marked = require('marked');

// 初始化路由
const router = new Router();

// 为API绑定url
router.use('/api', api.routes());

// 作品集
router.get('/portfolio', async ctx => {
    let page = parseInt(ctx.query.page);
    if (!page) { page = 1; }
    let result = await db.Work.findAndCountAll({
        order: 'createdAt DESC',
        offset: (page - 1) * config.perpage,
        limit: config.perpage
    });
    ctx.body = await ctx.render('portfolio', {
        works: result.rows,
        pages: Math.ceil(result.count / config.perpage),
        nav: "portfolio"
    });
});

// 关于我
router.get('/about', async ctx => {
    ctx.body = await ctx.render('about', {
        nav: 'about'
    })

});

// 后台
router.get('/admin', async ctx => {
    ctx.body = await ctx.render('manager')

});

// 添加中间件，用于显示分类和标签列表
router.use(async (ctx, next) => {
    ctx.cates = await db.Category.findAll({ include: [{ model: db.Article, attributes: ['id'] }] });
    ctx.tags = await db.Tag.findAll({ include: [{ model: db.Article, attributes: ['id'] }] });
    await next();
})

// 文章列表
router.get('/', async ctx => {
    let page = parseInt(ctx.query.page);
    if (!page) { page = 1; }
    let result = await db.Article.findAndCountAll({
        where: { hidden: { $not: true } },
        order: 'article.createdAt DESC',
        include: [db.Category, db.Tag],
        distinct: true,
        offset:(page-1)*config.perpage,
        limit:config.perpage
    });
    ctx.body = await ctx.render('blog', {
        articles: result.rows,
        currentPage: page,
        pages: Math.ceil((result.count - 1) / config.perpage),
        cates: ctx.cates,
        tags: ctx.tags,
        nav: "blog"
    });
});

// 某个标签的文章列表
router.get('/tags/:id', async ctx => {
    let page = parseInt(ctx.query.page);
    if (!page) { page = 1; }
    let tag = await db.Tag.findById(ctx.params.id);
    if (!tag) { ctx.redirect('/blog'); return; }
    let num = await tag.countArticles()
    let articles = await tag.getArticles({
        where: { hidden: { $not: true } },
        include: [db.Category, db.Tag],
        order: 'article.createdAt DESC',
        offset: (page - 1) * config.perpage,
        limit: config.perpage,
        distinct: true
    });
    ctx.body = await ctx.render('blog', {
        title: tag.name,
        subTitle: '标签',
        articles: articles,
        currentPage: page,
        pages: Math.ceil((num - 1) / config.perpage),
        cates: ctx.cates,
        tags: ctx.tags,
        nav: "blog"
    });
});

// 某个分类的文章列表
router.get('/categories/:name', async ctx => {
    let page = parseInt(ctx.query.page);
    if (!page) { page = 1; }
    let cate = await db.Category.findOne({ where: { name: ctx.params.name } });
    if (!cate) { ctx.redirect('/blog'); return; }
    let result = await db.Article.findAndCountAll({
        include: [db.Category, db.Tag],
        where: { categoryId: cate.id, hidden: { $not: true } },
        offset: (page - 1) * config.perpage,
        limit: config.perpage,
        distinct: true
    });
    ctx.body = await ctx.render('blog', {
        title: cate.title,
        subTitle: '类别',
        articles: result.rows,
        currentPage: page,
        pages: Math.ceil((result.count - 1) / config.perpage),
        cates: ctx.cates,
        tags: ctx.tags,
        nav: "blog"
    });
});

// 文章正文页
router.get('/articles/:id', async ctx => {
    let article = await db.Article.findOne({
        where: { id: ctx.params.id, hidden: { $not: true } },
        include: [db.Tag, db.Category, db.Comment]
    });
    if (!article) {
        ctx.status = 404;
        return;
    }
    let pre = await db.Article.findOne({
        where: { createdAt: { $lt: article.createdAt }, hidden: { $not: true } },
        attributes: ['id', 'title'],
        order: 'createdAt DESC',
    });
    let next = await db.Article.findOne({
        where: { createdAt: { $gt: article.createdAt }, hidden: { $not: true } },
        attributes: ['id', 'title'],
        offset: 1,
        order: 'createdAt',
    });
    if (!article) { ctx.redirect('/blog'); return; }
    ctx.body = await ctx.render('article', {
        article: article,
        article_content: marked(article.content),
        tags: ctx.tags,
        cates: ctx.cates,
        pre: pre,
        next: next,
        nav: "blog"
    });
});

// 发表评论
router.post('/articles/comments', async ctx => {
    let data = ctx.request.body;
    if (!(data.content && data.uname && data.email && data.aid)) {
        ctx.body = await ctx.render('base', {
            content: "参数错误！"
        });
        return;
    }
    let article = await db.Article.findById(data.aid);
    if (!article) {
        ctx.body = await ctx.render('base', { content: "文章不存在" });
        return;
    }
    let comment = await db.Comment.create({
        uname: data.uname,
        content: data.content,
        articleId: data.aid,
        email: data.email
    });
    ctx.redirect('/articles/' + data.aid);
});

module.exports = router;