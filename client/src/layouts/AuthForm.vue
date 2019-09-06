<template>
  <v-app>
    <v-content class="grey lighten-4">
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md4>
            <v-card class="elevation-12" light>
              <v-toolbar dark color="primary">
                <v-toolbar-title>{{title}}</v-toolbar-title>
              </v-toolbar>
              <v-card-text>
                <form :action="url" method="POST" ref="form">
                  <v-text-field prepend-icon="person" name="username" label="使用者名稱" type="text"></v-text-field>
                  <v-text-field id="password" prepend-icon="lock" name="password" label="密碼" type="password"></v-text-field>
                </form>
                或
                <br />
                <a :href="anotherUrl">{{anotherText}}</a>
                <br />
                <a :href="facebookUrl">{{facebookText}}</a>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="submit">{{text}}</v-btn>
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
  export default {
    data: () => ({
      
    }),

    props: {
      action: {
        type: String,
        default: 'login'
      },
      connect: {
        type: Boolean,
        default: false
      }
    },

    methods: {
      submit: function() {
        this.$refs.form.submit()
      }
    },

    computed: {
      title: function() {
        if (this.action == 'login') return (this.connect? '連結帳號 - ': '') + '登入'
        else if (this.action == 'signup') return (this.connect? '連結帳號 - ': '') + '註冊'
      },
      text: function() {
        if (this.action == 'login') return '登入'
        else if (this.action == 'signup') return '註冊'
      },
      anotherText: function() {
        if (this.action == 'login') return '註冊'
        else if (this.action == 'signup') return '登入'
      },
      url: function() {
        if (this.action == 'login') return (this.connect? '/connect': '') + '/login'
        else if (this.action == 'signup') return (this.connect? '/connect': '') + '/signup'
      },
      anotherUrl: function() {
        if (this.action == 'login') return (this.connect? '/connect': '') + '/signup'
        else if (this.action == 'signup') return (this.connect? '/connect': '') + '/login'
      },
      facebookText: function() {
        if (this.action == 'login') return '使用 Facebook 登入'
        else if (this.action == 'signup') return '使用 Facebook 註冊'
      },
      facebookUrl: function() {
        return (this.connect? '/connect': '/auth') + '/facebook'
      }
    }
  }
</script>