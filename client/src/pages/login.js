import { Vue, vuetify } from '../main'

import CenteredForm from './layouts/CenteredForm.vue'

Vue.component('centered-form', CenteredForm)

new Vue({
	data: {
		
	},
	vuetify
}).$mount('#app')