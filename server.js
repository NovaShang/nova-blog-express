const Koa = require('koa');
const static = require('koa-static');
const swig = require('koa2-swig');
const router = require('./router');
const bodyparser = require('koa-bodyparser');
const app = new Koa();
app.use(bodyparser());
app.use(static('public'));
app.context.render = swig({
    root: './views',
    autoescape: true,
    cache: false,
    ext: 'html',
});
app.use(router.routes());

//===============================Run==============================

if (process.argv[2] == 'runserver') {
    app.listen(80);

} else {
    app.listen(8000);
}