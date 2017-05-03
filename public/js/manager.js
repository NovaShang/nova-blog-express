const app = new Vue({
    el: '#app',
    delimiters: ['${', '}'],
    data: {
        password: '',
        savePassword: false,
        token: '',
        showLogin: true,
        articles: [],
        currentFunction: ''
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
        addTag: function() {


        },


    }
});



}

const resArticle = Vue.resource('/api/articles{/id}');
const resTag = Vue.resource('/api/tags{/id}');
const resCategory = Vue.resource('/api/categories{/id}');