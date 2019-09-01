<template>
  <v-app>
    <v-content class="grey lighten-4">
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md4>
            <v-card class="elevation-12" light>
              <v-toolbar dark color="primary">
                <v-toolbar-title>{{action}}</v-toolbar-title>
              </v-toolbar>
              <v-card-text>
                <form :action="url" method="POST" ref="form">
                  <v-text-field prepend-icon="person" name="username" label="使用者名稱" type="text"></v-text-field>
                  <v-text-field id="password" prepend-icon="lock" name="password" label="密碼" type="password"></v-text-field>
                </form>
                或
                <br />
                <a href="/signup">{{another}}</a>
                <br />
                <a href="/auth/facebook">{{facebook}}</a>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="submit">{{action}}</v-btn>
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
      url: String,
      action: {
        type: String,
        default: '登入'
      },
      another: {
        type: String,
        default: '註冊'
      },
      facebook: {
        type: String,
        default: '使用 Facebook 登入'
      }
    },

    methods: {
      submit: function() {
        this.$refs.form.submit()
      }
    }
  }
</script>