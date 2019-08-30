// for global
import adapter from 'webrtc-adapter'

// for Vue
import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import colors from 'vuetify/lib/util/colors'

import MainLayout from './layouts/MainLayout.vue'
import CenteredForm from './layouts/CenteredForm.vue'
import BoardLayout from './layouts/BoardLayout.vue'
import SummaryCard from './components/SummaryCard.vue'

Vue.use(Vuetify)

export default new Vuetify({
  theme: {
		primary: colors.cyan.darken2,
		secondary: colors.amber.darken2,
		accent: colors.pink.accent4,
		error: colors.red.darken4,
		warning: colors.orange,
		info: colors.grey.darken4,
		success: colors.lightGreen
	}
})

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
	}
})