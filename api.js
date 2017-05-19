const Router = require("koa-router");
const config = require('./config')
const db = require('./model')
const router = new Router();
const uuid = require('uuid');
const crypto = require('crypto');


global.token = "";

// 身份验证
router.post('/auth', async ctx => {
    if (!ctx.request.body.password) {
        ctx.body = { result: 'failed', message: 'No Password' };
        return;
    }
    if (crypto.createHmac('sha256', config.adminKey).update(ctx.request.body.password).digest('hex') == config.adminPassword) {
        global.token = uuid.v1().replace(/-/g, '');
        ctx.body = { result: 'success', token: global.token }
    } else {
        ctx.body = { result: 'failed', message: 'Invalid Password' };
        return;
    }
});

// GET /articles
router.get('/articles', async ctx => {
    ctx.body = await db.Article.findAll({
        where: {
            hidden: { not: true }
        },
        attributes: ['id', 'title', 'createdAt', 'count'],
        include: [db.Tag, db.Category]
    });
});

// GET /articles/:id
router.get('/articles/:id', async ctx => {
    let result = await db.Article.findOne({
        where: { id: ctx.params.id },
        include: [db.Tag, db.Category]
    });
    if (!result) {
        ctx.body = { result: 'failed', message: 'None' };
        return;
    }
    ctx.body = result;
});

// 添加文章
router.post('/articles', async ctx => {
    if (!ctx.request.body.token || ctx.request.body.token != global.token) {
        ctx.body = { result: 'failed', message: 'Invalid Token' };
        return;
    }
    if (!ctx.request.body.tags) { ctx.body = { result: 'failed', message: 'No Tags' }; return; }
    var tags = (await db.Tag.findAll()).filter(x => ctx.request.body.tags.some(y => y.name));
    var cate = await db.Category.findOne({ where: { name: ctx.request.body.cate } });
    if (!cate) { ctx.body = { result: 'failed', message: 'Invalid Category' }; return; }
    var article = await db.Article.create({
        title: ctx.request.body.title,
        summary: ctx.request.body.summary,
        content: ctx.request.body.content
    });
    article.setCategory(cate);
    article.setTags(tags);
    ctx.body = { result: 'success', url: 'articles/' + article.id };
});

// 修改文章
router.put('/articles', async ctx => {
    if (!ctx.request.body.token || ctx.request.body.token != global.token) {
        ctx.body = { result: 'failed', message: 'Invalid Token' };
        return;
    }
    var article = await db.Article.findOne({
        where: { id: ctx.request.body.id }
    });
    if (!article) { ctx.body = { result: 'failed', message: 'Article Not Found!' }; return; }
    article.title = ctx.request.body.title;
    article.content = ctx.request.body.content;
    article.summary = ctx.request.body.summary;
    await article.save();
    ctx.body = { result: 'success', url: 'articles/' + article.id };
});

// 删除文章
router.delete('/articles', async ctx => {
    if (!ctx.request.body.token || ctx.request.body.token != global.token) {
        ctx.body = { result: 'failed', message: 'Invalid Token' };
        return;
    }
    var article = await db.Article.findOne({ where: { id: ctx.request.body.id } });
    if (!article) { ctx.body = { result: 'failed', message: 'Article Not Found!' }; return; }
    await article.remove();
    ctx.body = { result: 'success' };

})

// 获取所有标签
router.get('/tags', async ctx => {
    ctx.body = await db.Tag.findAll();
});

// 创建新标签
router.post('/tags', async ctx => {
    if (!ctx.request.body.token || ctx.request.body.token != global.token) {
        ctx.body = { result: 'failed', message: 'Invalid Token' };
        return;
    }
    if (!ctx.request.body.name) { ctx.body = { result: 'failed', message: 'Invalid tag name' }; return; }
    let tag = await db.Tag.create({
        name: ctx.request.body.name,
    });
    ctx.body = { result: 'success', tag: tag };
});

// 修改标签
router.put('/tags', async ctx => {
    if (!ctx.request.body.token || ctx.request.body.token != global.token) {
        ctx.body = { result: 'failed', message: 'Invalid Token' };
        return;
    }
    let tag = db.Tag.findOne({ where: { id: ctx.request.body.id } });
    if (!tag) { ctx.body = { result: 'failed', message: 'Tag Not Found!' }; return; }
    tag.name = ctx.request.body.name;
    await tag.save();
    ctx.body = { result: 'success' };
});

// 删除标签
router.delete('api/tags', async ctx => {
    if (!ctx.request.body.token || ctx.request.body.token != global.token) {
        ctx.body = { result: 'failed', message: 'Invalid Token' };
        return;
    }
    let tag = db.Tag.findOne({ where: { id: ctx.request.body.id } });
    if (!tag) { ctx.body = { result: 'failed', message: 'Tag Not Found!' }; return; }
    await tag.remove();
    ctx.body = { result: 'success' };
})

// 获取所有分类
router.get('/categories', async ctx => {
    ctx.body = await db.Category.findAll();
});

// 添加新分类
router.post('/categories', async ctx => {
    if (!ctx.request.body.token || ctx.request.body.token != global.token) {
        ctx.body = { result: 'failed', message: 'Invalid Token' };
        return;
    }
    if (!(ctx.request.body.name && ctx.request.body.title)) { ctx.body = { result: 'failed', message: 'Invalid category' }; return; }
    let cate = await db.Category.create({
        name: ctx.request.body.name,
        title: ctx.request.body.title
    });
    ctx.body = { result: 'success', category: cate };
});

// 修改现有分类
router.put('/categories', async ctx => {
    if (!ctx.request.body.token || ctx.request.body.token != global.token) {
        ctx.body = { result: 'failed', message: 'Invalid Token' };
        return;
    }
    let category = await db.Category.findOne({ where: { id: ctx.request.body.id } });
    if (!category) { ctx.body = { result: 'failed', message: 'Category Not Found!' }; return; }
    category.name = ctx.request.body.name;
    category.title = ctx.request.body.title;
    await category.save()
    ctx.body = { result: 'success', category: cate };
});

// 删除分类
router.delete('/categories', async ctx => {
    if (!ctx.request.body.token || ctx.request.body.token != global.token) {
        ctx.body = { result: 'failed', message: 'Invalid Token' };
        return;
    }
    let category = await db.Category.findOne({ where: { id: ctx.request.body.id } });
    if (!category) { ctx.body = { result: 'failed', message: 'Category Not Found!' }; return; }
    await category.remove()
    ctx.body = { result: 'success', category: cate };
});

// 发布评论
router.post('/comments', async ctx => {
    let aid = parseInt(ctx.request.body.articleId)
    if (!(ctx.request.body.content && ctx.request.body.uname && ctx.request.body.email && aid)) {
        ctx.body = { result: 'failed', message: '请填写所有字段!' };
        return;
    }
    let article = await db.Article.findById(aid);
    if (!article) {
        ctx.body = { result: 'failed', message: '文章不存在!' };
        return;
    }
    let comment = await db.Comment.create({
        uname: ctx.request.body.uname,
        content: ctx.request.body.content,
        articleId: aid,
        email: ctx.request.body.email
    });
    ctx.body = { result: 'success', comment: comment };
});

// GET /api/works
router.get('/works', async ctx => {
    ctx.body = await db.Work.findAll({
        where: {
            hidden: { not: true }
        },
        attributes: ['id', 'name', 'summary'],
        include: [{
            model: db.Tech,
            attributes: ['name']
        }],
        order: 'work.createdAt DESC'
    });
});

// GET /api/works/id
router.get('/works/:id', async ctx => {
    ctx.body = await db.Work.findById(ctx.params.id);
});

// POST /api/works
router.post('/works', async ctx => {
    if (!(ctx.request.body.work && ctx.request.body.work.name && ctx.request.body.work.summary && ctx.request.body.work.content && (ctx.request.body.techs instanceof Array))) {
        ctx.body = { result: 'failed', message: '请填写所有字段!' };
        return;
    };
    let techs = await db.Tech.findAll();
    for (element of ctx.request.body.techs) {
        if (!techs.some(x => x.name == element)) {
            let tech = db.Tech.create({ name: element })
            techs.push(tech);
        }
    }
    let work = await db.Work.create(ctx.request.body.work);
    await work.setTeches(techs.filter(x => ctx.request.body.techs.some(y => x.name == y)));
    ctx.body = { result: 'success', id: work.id };
});

// PUT /api/works/id
router.put('/works/:id', async ctx => {
    if (!(ctx.request.body.work && ctx.request.body.work.name && ctx.request.body.work.summary && ctx.request.body.work.content && (ctx.request.body.techs instanceof Array))) {
        ctx.body = { result: 'failed', message: '请填写所有字段!' };
        return;
    };
    let work = await db.Work.findById(ctx.params.id);
    if (!work) {
        ctx.body = { result: 'failed', message: '作品不存在!' };
        return;
    }
    await work.update(ctx.request.body.work);
    let techs = await db.Tech.findAll();
    await work.setTechs(techs.filter(x => ctx.request.body.techs.some(y => x.name == y)));
    ctx.body = { result: 'success', id: work.id };
});

// DELETE /api/works/id
router.delete('/works/:id', async ctx => {
    let work = await db.Work.findById(ctx.params.id);
    if (!work) {
        ctx.body = { result: 'failed', message: '作品不存在!' };
        return;
    }
    work.hidden = true;
    await work.save();
    ctx.body = { result: 'success' };
})


module.exports = router;