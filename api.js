const Router = require("koa-router");
const config = require('./config')
const db = require('./model')
const router = new Router();
const uuid = require('uuid');
const crypto = require('crypto');


global.token = "";

// Verify Token
router.use(async (ctx, next) => {
    if (ctx.request.header.authorization && ctx.request.header.authorization == global.token) {
        ctx.isAuthed = true;
    }
    await next();
});

// POST api/auth
router.post('/auth', async ctx => {
    if (!ctx.request.body.password) {
        ctx.body = { result: 'failed', message: '缺少密码' };
        ctx.status = 400;
        return;
    }
    if (crypto.createHmac('sha256', config.adminKey).update(ctx.request.body.password).digest('hex') == config.adminPassword) {
        global.token = uuid.v1().replace(/-/g, '');
        ctx.body = { result: 'success', token: global.token }
    } else {
        ctx.body = { result: 'failed', message: '密码错误' };
        ctx.status = 401;
        return;
    }
});

// GET /articles
router.get('/articles', async ctx => {
    let result = await db.Article.findAll({
        where: {
            hidden: { not: true }
        },
        attributes: ['id', 'title', 'createdAt', 'count'],
        include: [{
            model: db.Tag,
            attributes: ['name']
        }, {
            model: db.Category,
            attributes: ['name', 'title']
        }]
    });
    let data = result.map(x => x.get({ plain: true }));
    data.forEach(x => {
        x.category = x.category.title;
        x.tags = x.tags.map(y => y.name);
    });
    ctx.body = data;
});

// GET /articles/:id
router.get('/articles/:id', async ctx => {
    let result = await db.Article.findOne({
        where: { id: ctx.params.id },
        include: [{
            model: db.Tag,
            attributes: ['name']
        }, {
            model: db.Category,
            attributes: ['name', 'title']
        }]
    });
    if (!result) {
        ctx.body = { result: 'failed', message: '没有找到该文章' };
        ctx.status = 404;
        return;
    }
    let d = result.get({ plain: true });
    d.category = d.category.title;
    d.tags = d.tags.map(y => y.name);
    ctx.body = d;
});

// POST /articles
router.post('/articles', async ctx => {
    if (!ctx.isAuthed) {
        ctx.body = { result: 'failed', message: '令牌错误' };
        ctx.status = 401;
        return;
    }
    let data = ctx.request.body;
    if (!(data && data.tags && data.category && data.title)) {
        ctx.body = { result: 'failed', message: '参数不完整' };
        ctx.status = 400;
        return;
    }
    let cate = await db.Category.findOne({ where: { title: data.category } });
    if (!cate) {
        ctx.body = { result: 'failed', message: '无效的类别' };
        ctx.status = 400;
        return;
    }
    let tags = await db.Tag.findAll({ where: { name: { $in: data.tags } } });
    let article = await db.Article.create(data);
    article.setCategory(cate);
    article.setTags(tags);
    await article.save();
    ctx.body = { result: 'success', id: article.id };
});

// PUT /api/articles/:id
router.put('/articles/:id', async ctx => {
    if (!ctx.isAuthed) {
        ctx.body = { result: 'failed', message: '令牌错误' };
        ctx.status = 401;
        return;
    }
    let data = ctx.request.body;
    data.id = undefined;
    if (!(data && data.tags && data.category && data.title)) {
        ctx.body = { result: 'failed', message: '参数不完整' };
        ctx.status = 400;
        return;
    }
    let article = await db.Article.findOne({
        where: { id: ctx.params.id }
    });
    if (!article) {
        ctx.body = { result: 'failed', message: '没有找到该文章' };
        ctx.status = 404;
        return;
    }
    let cate = await db.Category.findOne({ where: { title: data.category } });
    if (!cate) {
        ctx.body = { result: 'failed', message: '无效的类别' };
        ctx.status = 400;
        return;
    }
    let tags = await db.Tag.findAll({ where: { name: { $in: data.tags } } });
    await article.update(data);
    article.setCategory(cate);
    article.setTags(tags);
    await article.save();
    ctx.body = { result: 'success', url: 'articles/' + article.id };
});

// DELETE /api/articles/:id
router.delete('/articles/:id', async ctx => {
    if (!ctx.isAuthed) {
        ctx.body = { result: 'failed', message: '令牌错误' };
        ctx.status = 401;
        return;
    }
    let article = await db.Article.findOne({ where: { id: ctx.params.id } });
    if (!article) {
        ctx.body = { result: 'failed', message: '没有找到该文章' };
        ctx.status = 404;
        return;
    }
    article.hidden = true;
    await article.save();
    ctx.body = { result: 'success' };
});

// GET /api/tags
router.get('/tags', async ctx => {
    ctx.body = await db.Tag.findAll();
});

// POST /api/tags
router.post('/tags', async ctx => {
    if (!ctx.isAuthed) {
        ctx.body = { result: 'failed', message: '令牌错误' };
        ctx.status = 401;
        return;
    }
    let data = ctx.request.body;
    if (!data.name) {
        ctx.body = {
            result: 'failed',
            message: '参数不完整'
        };
        ctx.status = 400;
        return;
    }
    let tag = await db.Tag.create({
        name: ctx.request.body.name,
    });
    ctx.body = { result: 'success', tag: tag };
});

// GET /api/categories
router.get('/categories', async ctx => {
    ctx.body = await db.Category.findAll();
});

// POST /api/categories
router.post('/categories', async ctx => {
    if (!ctx.isAuthed) {
        ctx.body = { result: 'failed', message: '令牌错误' };
        ctx.status = 401;
        return;
    }
    let data = ctx.request.body;
    if (!(data && data.name && data.title)) {
        ctx.body = {
            result: 'failed',
            message: '参数不完整'
        };
        ctx.status = 400;
        return;
    }
    let cate = await db.Category.create({
        name: ctx.request.body.name,
        title: ctx.request.body.title
    });
    ctx.body = { result: 'success', category: cate };
});

// GET /api/works
router.get('/works', async ctx => {
    let result = await db.Work.findAll({
        where: {
            hidden: { not: true }
        },
        attributes: ['id', 'name', 'summary','title'],
        include: [{
            model: db.Tech,
            attributes: ['name']
        }],
        order: 'work.createdAt DESC'
    });
    let data = result.map(x => x.get({ plain: true }));
    data.forEach(x => {
        x.teches = x.teches.map(y => y.name);
    });
    ctx.body = data;

});

// GET /api/works/id
router.get('/works/:id', async ctx => {
    let result = await db.Work.findOne({where:{id:ctx.params.id},include:[db.Tech]});
    let d = result.get({ plain: true });
    d.teches = d.teches.map(x => x.name);
    ctx.body = d;
});

// POST /api/works
router.post('/works', async ctx => {
    if (!ctx.isAuthed) {
        ctx.body = { result: 'failed', message: '令牌错误' };
        ctx.status = 401;
        return;
    }
    let data = ctx.request.body;
    if (!(data && data.name && data.title && (data.teches instanceof Array))) {
        ctx.body = { result: 'failed', message: '请填写所有字段!' };
        ctx.status = 400;
        return;
    };
    let teches = await db.Tech.findAll({ where: { name: { $in: data.teches } } });
    let work = await db.Work.create(data);
    await work.setTeches(teches);
    ctx.body = { result: 'success', id: work.id };
});

// PUT /api/works/id
router.put('/works/:id', async ctx => {
    if (!ctx.isAuthed) {
        ctx.body = { result: 'failed', message: '令牌错误' };
        ctx.status = 401;
        return;
    }
    let data=ctx.request.body;
    if (!(data && data.name && data.title && (data.teches instanceof Array))) {
        ctx.body = { result: 'failed', message: '请填写所有字段!' };
        ctx.status = 400;
        return;
    };
    let work = await db.Work.findById(ctx.params.id);
    if (!work) {
        ctx.body = { result: 'failed', message: '作品不存在!' };
        ctx.status = 400;
        return;
    }
    await work.update(data);
    let teches = await db.Tech.findAll({ where: { name: { $in: data.teches } } });
    await work.setTeches(teches);
    ctx.body = { result: 'success', id: work.id };
});

// DELETE /api/works/id
router.delete('/works/:id', async ctx => {
    if (!ctx.isAuthed) {
        ctx.body = { result: 'failed', message: '令牌错误' };
        ctx.status = 401;
        return;
    }
    let work = await db.Work.findById(ctx.params.id);
    if (!work) {
        ctx.body = { result: 'failed', message: '作品不存在!' };
        ctx.status = 400;
        return;
    }
    work.hidden = true;
    await work.save();
    ctx.body = { result: 'success' };
})

// GET /api/teches/id
router.get('/teches', async ctx => {
    ctx.body = await db.Tech.findAll();
});

// POST /api/teches
router.post('/teches', async ctx => {
    if (!ctx.isAuthed) {
        ctx.body = { result: 'failed', message: '令牌错误' };
        ctx.status = 401;
        return;
    }
    let data = ctx.request.body;
    if (!data.name) {
        ctx.body = {
            result: 'failed',
            message: '参数不完整'
        };
        ctx.status = 400;
        return;
    }
    let tech = await db.Tech.create(data);
    ctx.body = { result: 'success', tech: tech };
});


module.exports = router;