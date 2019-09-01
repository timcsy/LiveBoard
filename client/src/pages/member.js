import { Vue, vuetify } from '../main'

import MainLayout from './layouts/MainLayout.vue'
import SummaryCard from './components/SummaryCard.vue'

Vue.component('main-layout', MainLayout)
Vue.component('summary-card', SummaryCard)

new Vue({
	data: {
		items: [
			{icon: 'account_circle', text: '連結帳號', url: '/connect/login'},
			{icon: 'account_circle', text: '登出', url: '/logout'},
			{ divider: true },
			{icon: 'call', text: '通話', url: '/board'}
		]
	},
	vuetify
}).$mount('#app')