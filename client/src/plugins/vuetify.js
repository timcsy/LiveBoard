import Vue from 'vue'
import Vuetify from 'vuetify/lib'

import colors from 'vuetify/lib/util/colors'

Vue.use(Vuetify)

export default new Vuetify({
  theme: {
		dark: true,
    themes: {
      dark: {
        primary: colors.cyan.darken2,
				secondary: colors.amber.darken2,
				accent: colors.pink.accent4,
				error: colors.red.darken4,
				warning: colors.orange,
				info: colors.grey.darken4,
				success: colors.lightGreen
      },
    },
	}
})