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

// 主页
router.get('/', async ctx => {
    ctx.body = await ctx.render('home');
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