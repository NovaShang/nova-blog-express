const db = require('./model');
const api = require('./api');
const blog = require('./blog')
const config = require('./config')
const Router = require('koa-router');

// 初始化路由
const router = new Router();

// 为API绑定url
router.use('/api', api.routes());
// 为Blog绑定url
router.use('/blog', blog.routes());


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

router.get('/about', async ctx => {
    ctx.body = await ctx.render('about', {
        nav: 'about'
    })

});


// 主页
router.get('/', async ctx => {
    let result = await db.Trace.findAll({
        order: 'createdAt DESC',
        limit: config.perpage
    });
    ctx.body = await ctx.render('home', {
        traces: result
    });
})

// Blog editor
router.get('/publish', async ctx => {
    ctx.body = await ctx.render('editor');
});


// Blog Manager
router.get('/manage', async ctx => {
    ctx.body = await ctx.render('manager')

});

module.exports = router;