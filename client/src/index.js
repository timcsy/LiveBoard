// for global
import adapter from 'webrtc-adapter'

// for Vue
import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css' // Ensure you are using css-loader
import colors from 'vuetify/es5/util/colors'

import MainLayout from './layouts/MainLayout.vue'
import CenteredForm from './layouts/CenteredForm.vue'
import BoardLayout from './layouts/BoardLayout.vue'
import SummaryCard from './components/SummaryCard.vue'

Vue.use(Vuetify, {
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
			{ icon: 'touch_app', text: 'Reminders' },
			{ divider: true },
			{ heading: 'Labels' },
			{ icon: 'add', text: 'Create new label' },
			{ divider: true },
			{ icon: 'archive', text: 'Archive' },
			{ icon: 'delete', text: 'Trash' },
			{ divider: true },
			{ icon: 'settings', text: 'Settings' },
			{ icon: 'chat_bubble', text: 'Trash' },
			{ icon: 'help', text: 'Help' },
			{ icon: 'phonelink', text: 'App downloads' },
			{ icon: 'keyboard', text: 'Keyboard shortcuts' }
		]
	}
})