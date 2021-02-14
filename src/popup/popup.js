import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App';
import axios from 'axios'
import VueClipboard from "vue-clipboard2";

global.browser = require('webextension-polyfill');
Vue.prototype.$browser = global.browser;
Vue.prototype.$axios = axios;

Vue.use(VueClipboard)
Vue.use(ElementUI, {size: 'mini', zIndex: 2000});

/* eslint-disable no-new */
new Vue({
    el: '#app',
    render: h => h(App),
});
