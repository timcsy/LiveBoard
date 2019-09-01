import { Vue, vuetify } from '../main'

import MainLayout from '../layouts/MainLayout.vue'
import CenteredForm from '../layouts/CenteredForm.vue'
import BoardLayout from '../layouts/BoardLayout.vue'
import SummaryCard from '../components/SummaryCard.vue'

Vue.component('main-layout', MainLayout)
Vue.component('centered-form', CenteredForm)
Vue.component('board-layout', BoardLayout)
Vue.component('summary-card', SummaryCard)

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