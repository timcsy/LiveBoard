<template>
  <v-app dark>

    <v-navigation-drawer v-model="drawer" fixed clipped class="grey lighten-4" app light>
      <v-list dense class="grey lighten-4">
        <div v-if="user">
          <v-toolbar flat class="transparent">
            <v-list class="pa-0">
              <v-list-tile avatar>
                <v-list-tile-avatar>
                  <img v-if="user.picture" :src="user.picture">
                  <v-icon v-else x-large>account_circle</v-icon>
                </v-list-tile-avatar>

                <v-list-tile-content>
                  <v-list-tile-title class="subheading">{{user.name || user.username}}</v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-list>
          </v-toolbar>
          <v-divider dark class="mb-3"></v-divider>
        </div>
        <div v-else class="mb-3"></div>

        <template v-for="(item, i) in items">
          <v-layout v-if="item.heading" :key="i" row align-center>
            <v-flex xs6>
              <v-subheader v-if="item.heading">
                {{item.heading}}
              </v-subheader>
            </v-flex>
          </v-layout>
          <v-divider v-else-if="item.divider" :key="i" dark class="my-3"></v-divider>
          <v-list-tile v-else  :key="i" :href="item.url">
            <v-list-tile-action>
              <v-icon>{{item.icon}}</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title class="grey--text">
                {{item.text}}
              </v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-toolbar color="primary" app fixed clipped-left>
      <v-toolbar-side-icon @click="drawer = !drawer"></v-toolbar-side-icon>
      <span class="title ml-3 mr-5">Liveboard</span>
      <v-text-field
        solo-inverted
        flat
        hide-details
        label="Search"
        prepend-inner-icon="search"
      ></v-text-field>
      <v-spacer></v-spacer>
    </v-toolbar>

    <v-content light>
      <v-layout align-center justify-start column fill-height>
        <v-container fluid class="grey lighten-4">
          
          <slot></slot>

        </v-container>
      </v-layout>
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
        default: function() {
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