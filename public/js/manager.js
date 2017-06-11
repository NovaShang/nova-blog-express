const app = new Vue({
    // html 标签
    el: '#app',
    // 定义分隔符
    delimiters: ['${', '}'],
    // 数据
    data: {
        auth: {
            password: '',
            savePassword: false,
            token: '',
        },
        newTagName: '',
        show: {
            login: true,
            sidebar: true,
            create: false,
            tags: false,
            createArticle: false
        },
        create: {
            article: {
                title: "",
                category: ""
            }
        },
        docs: [],
        currentDoc: null,
        data: {
            article: [],
            work: [],
            category: [],
            tag: [],
            folder: [],

        },
        currentModule: 'article'
    },
    created: function() {
        let savedPassword = window.localStorage.getItem('password');
        if (savedPassword) {
            this.auth.savePassword = true;
            this.auth.password = savedPassword;
            this.login();
        }
    },
    methods: {
        login: function() {
            this.$http.post('/api/auth', { password: this.auth.password })
                .then(response => {
                    if (response.body.result == 'success') {
                        this.auth.token = response.body.token;
                        this.show.login = false;
                        if (this.auth.savePassword) {
                            window.localStorage.setItem('password', this.auth.password);
                        }
                        this.refresh('article');
                        this.refresh('work');
                        this.refresh('category');
                        this.refresh('tag');
                        this.refresh('folder');
                        this.refresh('note')
                    } else {
                        alert(response.body.message);
                    }
                }, e => {
                    alert(e)
                })
        },

        logoff: function() {
            this.token = '';
            window.localStorage.removeItem('password');
            this.showLogin = true;
        },

        refresh: function(type) {
            res[type].query().then(
                resp => {
                    this.data[type] = resp.body
                    console.log(`刷新成功 > type: ${type}`);
                }, resp => {
                    console.log(`刷新失败 > type: ${type}`);
                });
        },
        addTag: function() {
            res.tag.save({}, { name: this.newTagName }).then(x => { this.refresh('tag') })
        },

        open: function(type, id) {
            Doc.open(type, id).then(
                result => {
                    if (result) {
                        if (this.currentDoc && this.currentDoc.dirty == false) {
                            this.docs.pop(this.currentDoc);
                        }
                        this.docs.push(result);
                        this.currentDoc = result;
                    }
                }, result => {
                    console.log(result);
                });
        },

        createArticle: function() {

        }
    }
});

Vue.http.interceptors.push(function(request, next) {
    request.headers.set('Authorization', app.auth.token);
    next(resp => resp);
});

const res = {
    article: Vue.resource('/api/articles{/id}'),
    tag: Vue.resource('/api/tags{/id}'),
    category: Vue.resource('/api/categories{/id}'),
    work: Vue.resource('/api/works{/id}'),
    note: Vue.resource('/api/notes{/id}'),
    folder: Vue.resource('/api/works{/id}')
}


const modelInfo = {
    article: { title: 'title', content: 'content' },
    work: { title: 'name', content: 'content' },
}



var Doc = function(type, data) {
    this.type = type;
    this.data = data;
    Object.defineProperty(this, 'title', {
        get: () => this.data[modelInfo[type].title],
        set: x => this.data[modelInfo[type].title] = x
    });
    Object.defineProperty(this, 'content', {
        get: () => this.data[modelInfo[type].content],
        set: x => {
            this.dirty = true;
            this.data[modelInfo[type].content] = x;
        }
    });
    this.dirty = false;
    this.html = marked(this.content);
}

Doc.prototype.save = function() {
    res[this.type].update({ id: this.data.id }, this.data).then(
        resp => {
            console.log(`保存文档成功 > type: ${this.type} id: ${this.id}`);
            return true;
        }, error => {
            console.error(`保存文档失败 > type: ${this.type} id: ${this.id} \n` + error);
            return false;
        });
}

Doc.open = function(type, id) {
    return res[type].get({ id: id }).then(
        resp => {
            console.log(`打开文档成功 > type: ${type} id: ${id}`);
            return new Doc(type, resp.body);
        }, error => {
            console.error(`打开文档失败 > type: ${type} id: ${id} \n` + error)
            return Promise.reject(error);
        });
}

Doc.new = function(type) {
    res[type].save({}, {}).then(
        resp => {


        }, error => {
            console.error(`创建文档失败 > type: ${type} id: ${id} \n` + error)
            return false;
        }
    )
}