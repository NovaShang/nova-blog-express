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
        currentFunction: '',
        showSidebar: true,
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
    }
});


const resArticle = Vue.resource('/api/articles{/id}');
const resTag = Vue.resource('/api/tags{/id}');
const resCategory = Vue.resource('/api/categories{/id}');
const resWork = Vue.resource('/api/works{/id}');