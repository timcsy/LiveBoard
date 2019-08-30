<template>
  <v-app>
    
    <v-navigation-drawer v-model="drawer" fixed clipped class="grey lighten-4" app light>
      <v-list dense class="grey lighten-4">
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

    <v-app-bar color="primary" app fixed clipped-left>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer">
        <v-icon>menu</v-icon>
      </v-app-bar-nav-icon>
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
    </v-app-bar>

    <v-content light fill-height>
      <v-container fluid class="grey lighten-4" fill-height>
        <v-layout align-center justify-start column>
          
          <slot></slot>

          <v-container v-if="!isCalling">
            <v-btn v-if="showCallBtn" @click="call()">Call</v-btn>
            <v-btn v-if="showHangupBtn" @click="hangup()">Hangup</v-btn>
            <v-list subheader light>
              <v-subheader>Invitations</v-subheader>

              <v-list-item
                v-for="(invitation, index) in inviteList"
                :key="invitation.id"
              >
                <v-list-item-avatar>
                  <v-img v-if="invitation.inviter.picture" :src="invitation.inviter.picture"></v-img>
                  <v-icon v-else x-large>account_circle</v-icon>
                </v-list-item-avatar>

                <v-list-item-content>
                  <v-list-item-title v-text="invitation.inviter.name"></v-list-item-title>
                </v-list-item-content>

                <v-list-item-icon @click="accept(index)">
                  <v-icon>call</v-icon>
                </v-list-item-icon>
                <v-list-item-icon @click="decline(index)">
                  <v-icon>call_end</v-icon>
                </v-list-item-icon>
              </v-list-item>
            </v-list>
          </v-container>

          <v-container v-else>
            <v-btn v-if="showCallBtn" @click="call()">Call</v-btn>
            <v-btn v-if="showHangupBtn" @click="hangup()">Hangup</v-btn>
          </v-container>

        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
  import axios from 'axios'
  import ws from '../modules/MainSocket'
  import Session from '../modules/Session'
  import LiveStream from '../modules/LiveStream'
  import Speech from '../modules/Speech'
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
        this.session.start()
        this.session.invite(this.contact)
      },
      hangup: async function () { // for both side
        this.session.close()
        await this.close()
      },
      accept: async function (index) {
        this.session.accept(this.inviteList[index].id, this.inviteList[index].inviter)
      },
      decline: async function (index) {
        this.session.decline(this.inviteList[index].id)
        this.inviteList.splice(index, 1)
      },
      ready: async function () { // for both side
        const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: false})
        this.stream.init(this.session, stream)
        this.speech.init(this.session, stream)
        this.speech.startRecognition()
      },
      close: async function () { // for both side
        this.showCallBtn = true
        this.showHangupBtn = false
        this.stream.close()
        this.speech.stopRecognition()
      }
    },
    created: async function () {
      try {
        const res = await axios.get('/api/identities')
        const user = res.data[0] || null
        this.user = user

        this.session = new Session()
        this.stream = new LiveStream()
        this.speech = new Speech()
        // setting ws events
        ws.on('session:invite', msg => {
          this.inviteList.push(msg.data)
        })
        ws.on('session:ready', async (msg) => { // for caller side
          await this.ready()
          this.session.send('webrtc:start')
        })
        ws.on('webrtc:start', async (msg) => { // for receiver side
          await this.ready()
          this.stream.start()
        })
        ws.on('session:close', msg => { // for passive side (w.r.t. hangup)
          await this.close()
        })
      } catch (err) {
        this.user = null
      }
    }
  }
</script>

<style>
  
</style>