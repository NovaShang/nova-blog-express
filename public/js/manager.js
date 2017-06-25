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
            tag: false,
            tech: false,
            category: false,
            article: false,
            work: false
        },
        objToCreate: {
            article: {
                title: "",
                category: "",
                content: "",
                tags: []
            },
            tag: {
                name: ""
            },
            category: {
                name: "",
                title: "",
            },
            work: {
                name: "",
                teches: [],
                content: ""
            },
            tech: {
                name: ""
            }
        },
        docs: [],
        currentDoc: null,
        data: {
            article: [],
            work: [],
            category: [],
            tag: [],
            tech: []
        },
        currentModule: 'article'
    },
    created: function () {
        let savedPassword = window.localStorage.getItem('password');
        if (savedPassword) {
            this.auth.savePassword = true;
            this.auth.password = savedPassword;
            this.login();
        }
    },
    methods: {
        login: function () {
            this.$http.post('/api/auth', { password: this.auth.password })
                .then(response => {
                    if (response.body.result == 'success') {
                        this.auth.token = response.body.token;
                        this.show.login = false;
                        if (this.auth.savePassword) {
                            window.localStorage.setItem('password', this.auth.password);
                        }
                        this.refresh('article');
                        this.refresh('category');
                        this.refresh('tag');
                        this.refresh('work');
                        this.refresh('tech');
                    } else {
                        alert(response.body.message);
                    }
                }, e => {
                    alert(e)
                });
        },
        logoff: function () {
            this.token = '';
            window.localStorage.removeItem('password');
            window.document.location.reload();
        },
        refresh: function (type) {
            res[type].query().then(
                resp => {
                    this.data[type] = resp.body
                    console.log(`刷新成功 > type: ${type}`);
                }, resp => {
                    console.log(`刷新失败 > type: ${type}`);
                });
        },
        create: function (type) {
            res[type].save({}, this.objToCreate[type]).then(x => {
                this.refresh(type)
            });
        },
        open: function (type, id) {
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
        hide: function (type, id) {
            res[type].delete({ id: id }).then(resp => {
                this.refresh(type);
            }, resp => {
                console.log("删除失败");
            });
        },
        createDoc: function (type) {
            Doc.new(type, this.objToCreate[type]).then(id => {
                this.open(type, id);
                this.refresh(type);
                this.objToCreate[type].title = "";
                this.show[type] = false;
            }, result => {
                console.log(result);
            });
        }
    }
});

Vue.http.interceptors.push(function (request, next) {
    request.headers.set('Authorization', app.auth.token);
    next(resp => resp);
});

const res = {
    article: Vue.resource('/api/articles{/id}'),
    tag: Vue.resource('/api/tags{/id}'),
    category: Vue.resource('/api/categories{/id}'),
    work: Vue.resource('/api/works{/id}'),
    tech: Vue.resource('/api/teches{/id}')
}

var Doc = function (type, data) {
    this.type = type;
    this.data = data;
    this.dirty = false;
    this.html = marked(data.content);
}

Doc.prototype.save = function () {
    res[this.type].update({ id: this.data.id }, this.data).then(
        resp => {
            console.log(`保存文档成功 > type: ${this.type} id: ${this.data.id}`);
            this.dirty = false;
            return true;
        }, error => {
            console.error(`保存文档失败 > type: ${this.type} id: ${this.data.id} \n` + error);
            alert("保存文件失败");
            return false;
        });
}

Doc.open = function (type, id) {
    return res[type].get({ id: id }).then(
        resp => {
            console.log(`打开文档成功 > type: ${type} id: ${id}`);
            return new Doc(type, resp.body);
        }, error => {
            console.error(`打开文档失败 > type: ${type} id: ${id} \n` + error)
            return Promise.reject(error);
        });
}

Doc.new = function (type, data) {
    return res[type].save({}, data).then(
        resp => {
            console.log(`新建文档成功 > type: ${type} id: ${resp.body.id}`);
            return resp.body.id;
        }, error => {
            console.error(`创建文档失败 > type: ${type} \n` + error)
            return Promise.reject(error);
        }
    );
}

