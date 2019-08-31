// for global
import adapter from 'webrtc-adapter'

// for Vue
import Vue from 'vue'
import vuetify from './plugins/vuetify'

import 'vue-fabric/dist/vue-fabric.min.css'
import { Fabric } from 'vue-fabric'
Vue.use(Fabric)

import MainLayout from './layouts/MainLayout.vue'
import CenteredForm from './layouts/CenteredForm.vue'
import BoardLayout from './layouts/BoardLayout.vue'
import SummaryCard from './components/SummaryCard.vue'

Vue.component('main-layout', MainLayout)
Vue.component('centered-form', CenteredForm)
Vue.component('board-layout', BoardLayout)
Vue.component('summary-card', SummaryCard)

const app = new Vue({
	el: '#app',
	data: {
		items: [
			{icon: 'home', text: '首頁', url: '/'},
			{icon: 'account_circle', text: '登入', url: '/login'},
			{icon: 'account_circle', text: '註冊', url: '/signup'},
			{ divider: true },
			{ heading: 'Pages' },
			{ icon: 'touch_app', text: 'Reminders' }
		]
	},
	vuetify
}).$mount('#app')