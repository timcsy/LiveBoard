<template>
  <v-app-bar app>

    <v-navigation-drawer v-model="drawer" fixed clipped class="grey lighten-4" app light>
      <v-list dense class="grey lighten-4">
        <div v-if="user">
          <v-toolbar flat class="transparent">
            <v-list class="pa-0">
              <v-list-item avatar>
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
          <v-layout v-if="item.heading" :key="i" row align-center>
            <v-flex xs6>
              <v-subheader v-if="item.heading">
                {{item.heading}}
              </v-subheader>
            </v-flex>
          </v-layout>
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

    <v-toolbar color="primary" app fixed clipped-left>
      <v-toolbar-side-icon @click="drawer = !drawer"></v-toolbar-side-icon>
      <span class="title ml-3 mr-5">Liveboard</span>
      <v-text-field
        solo-inverted
        flat
        hide-details
        label="Contact"
        prepend-inner-icon="search"
        v-model="contact"
      ></v-text-field>
      <v-spacer></v-spacer>
    </v-toolbar>

    <v-content light>
      <v-layout align-center justify-start column fill-height>
        <v-container fluid class="grey lighten-4">
          
          <slot></slot>

          <v-layout v-if="!isCalling">
            <v-btn v-if="showCallBtn" @click="call()">Call</v-btn>
            <v-btn v-if="showHangupBtn" @click="hangup()">Hangup</v-btn>
            <v-list subheader>
              <v-subheader>Invitations</v-subheader>

              <v-list-item
                v-for="invitation in inviteList"
                :key="invitation.id"
                @click=";"
              >
                <v-list-item-avatar>
                  <v-img :src="invitation.inviter.picture"></v-img>
                </v-list-item-avatar>

                <v-list-item-content>
                  <v-list-item-title v-text="invitation.inviter.name"></v-list-item-title>
                </v-list-item-content>

                <v-list-item-icon>
                  <v-icon>chat_bubble</v-icon>
                </v-list-item-icon>
              </v-list-item>
            </v-list>
          </v-layout>

          <v-layout v-if="isCalling">
            <v-btn v-if="showCallBtn" @click="call()">Call</v-btn>
            <v-btn v-if="showHangupBtn" @click="hangup()">Hangup</v-btn>
          </v-layout>

        </v-container>
      </v-layout>
    </v-content>

  </v-app-bar>
</template>

<script>
  import axios from 'axios'
  import ws from '../modules/MainSocket'
  import Session from '../modules/Session'
  import LiveStream from '../modules/LiveStream'
  export default {
    data: () => ({
      drawer: null,
      user: {
        name: '',
        picture: ''
      },
      showCallBtn: true,
      showHangupBtn: false,
      contact: '',
      isCalling: false,
      inviteList: []
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
      call: async function () {
        this.showCallBtn = false
        this.showHangupBtn = true
        const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: false})
        this.session = new Session()
        this.session.start()
        this.session.invite(this.contact)
        this.stream = new LiveStream(this.session, stream)
        const startTime = Date.now()
        this.session.send('webrtc:start', { time: startTime })
      },
      hangup: async function () {
        this.showCallBtn = true
        this.showHangupBtn = false
        this.stream.close()
      },
    },
    created: async function () {
      try {
        const res = await axios.get('/api/identities')
        const user = res.data[0] || null
        this.user = user

        // setting ws events
        ws.on('session:invite', msg => {
          this.inviteList.push(msg.data)
        })
      } catch (err) {
        this.user = null
      }
    }
  }
</script>

<style>
  
</style>