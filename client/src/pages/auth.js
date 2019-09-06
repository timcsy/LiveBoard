import { Vue, vuetify } from '../main'

import AuthForm from '../layouts/AuthForm.vue'

Vue.component('auth-form', AuthForm)

new Vue({
	data: {
		
	},
	vuetify
}).$mount('#app')