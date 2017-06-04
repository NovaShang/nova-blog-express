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
        show: {
            login: true,
            sidebar: true,
            create: true,
        },
        docs: [],
        currentDoc: {},
        data: {
            articles: [],
            works: [],
            categories: [],
            tags: []
        },
        currentModule: 'article'
    },
    created: function() {
        let savedPassword = window.localStorage.getItem('password')
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
                        this.token = response.body.token;
                        this.show.login = false;
                        if (this.savePassword) {
                            window.localStorage.setItem('password', this.password);
                        }
                        this.refreshArticles();
                        this.refreshWorks();
                        this.refreshCategories();
                        this.refreshTags();
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
        addTab: function() {},
        addTag: function() {},
        refreshArticles: function() {
            res.article.query().then(resp => {
                this.data.articles = resp.body;

            })
        },
        refreshWorks: function() {
            res.work.query().then(resp => {
                this.data.works = resp.body;

            })
        },
        open: function(type, id) {
            Doc.open(type, id).then(
                result => {
                    if (result) {
                        this.docs.push(result);
                    }
                }
            )
        }
    }
});

const res = {
    article: Vue.resource('/api/articles{/id}'),
    tag: Vue.resource('/api/tags{/id}'),
    category: Vue.resource('/api/categories{/id}'),
    work: Vue.resource('/api/works{/id}')
}

Vue.http.interceptors.push(function(request, next) {
    request.headers.set('Authorization', app.auth.token);
    next();
});

var Doc = function(type, data) {
    this.type = type;
    this.data = data;
    this.title = {
        get: () => this.data.title,
        set: x => this.data.title = x
    };
    this.content = {
        get: () => this.data.content,
        set: x => this.data.content = x
    };
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