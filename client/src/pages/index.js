import { Vue, vuetify } from '../main'

import MainLayout from '../layouts/MainLayout.vue'

Vue.component('main-layout', MainLayout)

new Vue({
	data: {
		items: [
			{icon: 'home', text: '首頁', url: '/'},
			{icon: 'account_circle', text: '登入', url: '/login'},
			{icon: 'account_circle', text: '註冊', url: '/signup'},
			{ divider: true }
		]
	},
	vuetify
}).$mount('#app')