var app = new Vue({
    el: '#app',
    delimiters: ['${', '}'],
    data: {
        tabIndex: null,
        tabs: [],
        tabCounter: 0,
        password:''
    },
    methods: {
        login(){
            var resource=this.$resource('articles{/id}');
            

        },


        closeTab(x) {
            for (let i = 0; i < this.tabs.length; i++) {
                if (this.tabs[i] === x) {
                    this.tabs.splice(i, 1);
                }
            }
        },
        newTab() {
            this.tabs.push(this.tabCounter++);
        }
    }

})