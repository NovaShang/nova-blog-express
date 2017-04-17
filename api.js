const Router = require("koa-router");
const bodyparser = require('koa-bodyparser');
const db = require('./model')
const router = new Router();
router.use(bodyparser());

// 获取文章
router.get('/articles', async ctx => {
    ctx.body = await db.Article.findAll();
});

// 添加文章
router.post('/articles', async ctx => {
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
    if (!ctx.request.body.name) { ctx.body = { result: 'failed', message: 'Invalid tag name' }; return; }
    let tag = await db.Tag.create({
        name: ctx.request.body.name,
    });
    ctx.body = { result: 'success', tag: tag };
});

// 修改标签
router.put('/tags', async ctx => {
    let tag = db.Tag.findOne({ where: { id: ctx.request.body.id } });
    if (!tag) { ctx.body = { result: 'failed', message: 'Tag Not Found!' }; return; }
    tag.name = ctx.request.body.name;
    await tag.save();
    ctx.body = { result: 'success' };
});

// 删除标签
router.delete('api/tags', async ctx => {
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
    if (!(ctx.request.body.name && ctx.request.body.title)) { ctx.body = { result: 'failed', message: 'Invalid category' }; return; }
    let cate = await db.Category.create({
        name: ctx.request.body.name,
        title: ctx.request.body.title
    });
    ctx.body = { result: 'success', category: cate };
});

// 修改现有分类
router.put('/categories', async ctx => {
    let category = await db.Category.findOne({ where: { id: ctx.request.body.id } });
    if (!category) { ctx.body = { result: 'failed', message: 'Category Not Found!' }; return; }
    category.name = ctx.request.body.name;
    category.title = ctx.request.body.title;
    await category.save()
    ctx.body = { result: 'success', category: cate };
});

// 删除分类
router.delete('/categories', async ctx => {
    let category = await db.Category.findOne({ where: { id: ctx.request.body.id } });
    if (!category) { ctx.body = { result: 'failed', message: 'Category Not Found!' }; return; }
    await category.remove()
    ctx.body = { result: 'success', category: cate };
});

module.exports = router;