<template>
  <v-app>
    <v-content class="grey lighten-4">
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md4>
            <v-card class="elevation-12 grey lighten-4">
              <v-toolbar dark color="primary">
                <v-toolbar-title>Login form</v-toolbar-title>
              </v-toolbar>
              <v-card-text>
                <form :action="action" method="POST" ref="form">
                  <v-text-field prepend-icon="person" name="username" label="Username" type="text"></v-text-field>
                  <v-text-field id="password" prepend-icon="lock" name="password" label="Password" type="password"></v-text-field>
                </form>
                or
                <br />
                <a href="/signup">Sign up</a>
                <br />
                <a href="/auth/facebook">Log in with Facebook</a>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="submit">Login</v-btn>
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
      drawer: null
    }),

    props: {
      action: String
    },

    methods: {
      submit: function() {
        this.$refs.form.submit()
      }
    }
  }
</script>