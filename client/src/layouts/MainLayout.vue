<template>
  <v-app class="grey lighten-4">

    <v-navigation-drawer v-model="drawer" fixed clipped class="grey lighten-4" app light>
      <v-list dense subheader class="grey lighten-4">
        <div v-if="user">
          <v-toolbar flat class="transparent">
            <v-list class="pa-0">
              <v-list-item>
                <v-list-item-avatar>
                  <img v-if="user.picture" :src="user.picture">
                  <v-icon v-else x-large>account_circle</v-icon>
                </v-list-item-avatar>

                <v-list-item-content>
                  <v-list-item-title class="subheading">{{user.name || user.username}}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-toolbar>
          <v-divider dark class="mb-3"></v-divider>
        </div>
        <div v-else class="mb-3"></div>

        <template v-for="(item, i) in items">
          <v-subheader v-if="item.heading" :key="i">
            {{item.heading}}
          </v-subheader>
          <v-divider v-else-if="item.divider" :key="i" dark class="my-3"></v-divider>
          <v-list-item v-else  :key="i" :href="item.url">
            <v-list-item-action>
              <v-icon>{{item.icon}}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title class="grey--text">
                {{item.text}}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar color="primary" app fixed clipped-left>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer">
        <v-icon>menu</v-icon>
      </v-app-bar-nav-icon>
      <span class="title ml-3 mr-5">Live Board</span>

      <div class="flex-grow-1"></div>

    </v-app-bar>

    <v-content light class="grey lighten-4" fill-height>
      <v-container fill-height>
        <v-layout wrap class="justify-space-around">
          <slot></slot>
        </v-layout>
      </v-container>
      
    </v-content>

  </v-app>
</template>

<script>
  import axios from 'axios'
  export default {
    data: () => ({
      drawer: null,
      user: {
        name: '',
        picture: ''
      }
    }),
    props: {
      items: {
        type: Array,
        default: () => {
          return [
            {icon: 'home', text: '首頁', url: '/'}
          ]
        }
      }
    },
    methods: {
      
    },
    created: async function () {
      try {
        const res = await axios.get('/api/identities')
        const user = res.data[0] || null
        this.user = user
      } catch (err) {
        this.user = null
      }
    }
  }
</script>

<style>
  
</style>