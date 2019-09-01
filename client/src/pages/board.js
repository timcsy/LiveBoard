import { Vue, vuetify } from '../main'

import BoardLayout from '../layouts/BoardLayout.vue'

Vue.component('board-layout', BoardLayout)

new Vue({
	data: {
		
	},
	vuetify
}).$mount('#app')