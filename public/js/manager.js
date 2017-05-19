const app = new Vue({
    // html 标签
    el: '#app',
    // 定义分隔符
    delimiters: ['${', '}'],
    // 数据
    data: {
        // 登陆
        password: '',
        savePassword: false,
        token: '',
        showLogin: true,
        // 
        articles: [],
        works: [],


        tabs: [],
        currentTab: {},
        currentFunction: '',
        showSidebar: true,
        showCreate: true,
        currentModule: 'article'
    },
    created: function() {
        let savedPassword = window.localStorage.getItem('password')
        if (savedPassword) {
            this.savePassword = true;
            this.password = savedPassword;
            this.login();
        }
    },
    methods: {
        login: function() {
            this.$http.post('/api/auth', { password: this.password })
                .then(response => {
                    if (response.body.result == 'success') {
                        this.token = response.body.token;
                        this.showLogin = false;
                        if (this.savePassword) {
                            window.localStorage.setItem('password', this.password);
                        }
                        this.refreshArticles();
                        this.refreshWorks();
                    } else {
                        alert(response.body.message);
                    }
                }, e => {
                    alert(e)
                })
                .then()
        },
        logoff: function() {
            this.token = '';
            window.localStorage.removeItem('password');
            this.showLogin = true;
        },
        addTab: function() {
            let newWorkTab = {
                title: "Untitled",
                rawContent: "",
                renderedContent: "",
                data: null,
                type: "work",
                sourceId: 0
            }
            this.tabs.push(newWorkTab);
            this.currentTab = newWorkTab;
        },
        addTag: function() {


        },
        refreshArticles: function() {
            resArticle.query().then(resp => {
                this.articles = resp.body;

            })
        },
        refreshWorks: function() {
            resWork.query().then(resp => {
                this.works = resp.body;

            })
        },
        openArticle: function(id) {
            if (!this.currentTab.dirty && this.currentTab.type == "article") {
                this.tabs.pop(this.currentTab);
            }
            let opened = this.tabs.filter(x => x.data.id == id && x.type == "article")
            if (opened.length > 0) {
                this.currentTab = opened[0];
            } else {
                resArticle.query({ id: id }).then(
                    resp => {
                        let data = resp.body;
                        let tab = new Tab("article", data, data.title, data.content);
                        this.tabs.push(tab);
                        this.currentTab = tab;
                    }
                )
            };




        }
    }
});


const resArticle = Vue.resource('/api/articles{/id}');
const resTag = Vue.resource('/api/tags{/id}');
const resCategory = Vue.resource('/api/categories{/id}');
const resWork = Vue.resource('/api/works{/id}');
const Tab = function(type, data, title, content) {
    this.type = type;
    this.data = data;
    this.title = title;
    this.content = content;
    this.dirty = false;
    this.html = marked(content);
}