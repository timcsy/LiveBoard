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

        <v-divider dark class="my-3"></v-divider>
        <v-subheader v-if="isCalling">畫板設定</v-subheader>
        <v-list-item v-if="isCalling">
          <v-btn class="ml-1" @click="board.clear()">清除畫板</v-btn>
        </v-list-item>

        <v-list-item v-if="isCalling">
          <v-switch v-model="drawMode" inset label="物件/繪圖模式" class="ml-1" color="primary"></v-switch>
        </v-list-item>

        <v-subheader v-if="isCalling">畫筆大小</v-subheader>
        <v-slider v-model="brushSize" min="0" max="200" hide-details class="ml-1" v-if="isCalling"></v-slider>
        <v-text-field v-model="brushSize" class="px-2" single-line hide-details type="number" v-if="isCalling"></v-text-field>

        <v-subheader v-if="isCalling">畫筆顏色</v-subheader>
        <v-color-picker show-swatches v-model="color" v-if="isCalling"></v-color-picker>

      </v-list>
    </v-navigation-drawer>

    <v-app-bar color="primary" app fixed clipped-left clipped-right>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer">
        <v-icon>menu</v-icon>
      </v-app-bar-nav-icon>
      <v-text-field
        solo-inverted
        flat
        hide-details
        label="對方使用者名稱"
        prepend-inner-icon="search"
        v-model="contact"
        class="px-1"
        v-if="!isCalling"
      ></v-text-field>
      <v-btn icon v-if="!isCalling" @click="call()">
        <v-icon>call</v-icon>
      </v-btn>

      <v-btn icon v-if="isCalling" @click="hangup()">
        <v-icon>call_end</v-icon>
      </v-btn>

      <div class="flex-grow-1"></div>

      <v-app-bar-nav-icon @click.stop="board.add()" v-if="isCalling">
        <v-icon>add</v-icon>
      </v-app-bar-nav-icon>

      <v-app-bar-nav-icon @click.stop="changeBrush()" v-if="isCalling">
        <v-icon v-if="brush == 'pencil'">{{mdiEraser}}</v-icon>
        <v-icon v-else>brush</v-icon>
      </v-app-bar-nav-icon>

      <v-app-bar-nav-icon @click.stop="rightDrawer = !rightDrawer" v-if="isCalling">
        <v-icon>chat</v-icon>
      </v-app-bar-nav-icon>
      
    </v-app-bar>

    <v-content light class="grey lighten-4" fill-height>

      <v-row v-if="!isCalling" d-flex align="start" justify="center">
        <v-col sm="12" md="8" lg="6">
          <v-sheet d-flex elevation="1">
            <v-list d-flex subheader light>
              <v-subheader>通話邀請</v-subheader>

              <v-list-item
                v-for="(invitation, index) in inviteList"
                :key="invitation.id"
              >
                <v-list-item-avatar>
                  <v-img v-if="invitation.inviter.picture" :src="invitation.inviter.picture"></v-img>
                  <v-icon v-else>account_circle</v-icon>
                </v-list-item-avatar>

                <v-list-item-content>
                  <v-list-item-title v-text="invitation.inviter.name"></v-list-item-title>
                </v-list-item-content>

                <v-list-item-icon @click="accept(index)">
                  <v-icon color="light-green">call</v-icon>
                </v-list-item-icon>
                <v-list-item-icon @click="decline(index)">
                  <v-icon color="red">call_end</v-icon>
                </v-list-item-icon>
              </v-list-item>
            </v-list>
          </v-sheet>
        </v-col>
      </v-row>
      
      <v-layout ref="square" v-else v-resize="onResize" d-flex align-center justify-center fill-height fluid>
        <v-sheet :width="squareSize" :height="squareSize" class="white ma-2" elevation="1">
          <div style="position: absolute">
            <canvas id="remote_canvas" width="0" height="0"></canvas>
          </div>
          <div style="position: absolute">
            <canvas id="local_canvas" width="0" height="0"></canvas>
          </div>
        </v-sheet>

      </v-layout>
    </v-content>

    <v-navigation-drawer v-model="rightDrawer" fixed clipped right app light v-if="isCalling">
      <v-list subheader>
        <v-subheader>對話</v-subheader>

        <v-list-item
          :class="record.isLocal? 'white': 'grey lighten-2'"
          v-for="(record, index) in chat"
          :key="index"
        >
          <v-avatar size="36" class="mr-2">
            <img v-if="record.isLocal && user.picture" :src="user.picture">
            <img v-else-if="!record.isLocal && receiver.picture" :src="receiver.picture">
            <v-icon v-else x-large>account_circle</v-icon>
          </v-avatar>

          <span>
            {{record.text}}
          </span>
        </v-list-item>
        
      </v-list>
    </v-navigation-drawer>

  </v-app>
</template>

<script>
  import axios from 'axios'
  import ws from '../modules/MainSocket'
  import Session from '../modules/Session'
  import LiveStream from '../modules/LiveStream'
  import Speech from '../modules/Speech'
  import Board from '../modules/Board'
  import { mdiEraser } from '@mdi/js'
  export default {
    data: () => ({
      drawer: null,
      rightDrawer: null,
      user: {
        name: '',
        picture: ''
      },
      showCallBtn: true,
      showHangupBtn: false,
      contact: '',
      isCalling: false,
      inviteList: [],
      receiver: {
        name: '',
        picture: ''
      },
      chat: [],
      squareSize: 0,
      brush: 'pencil',
      mdiEraser: mdiEraser,
      drawMode: true,
      brushSize: 10,
      color: '#000000'
    }),
    props: {
      items: {
        type: Array,
        default: () => {
          return [
            {icon: 'home', text: '首頁', url: '/'},
            {icon: 'account_circle', text: '連結帳號', url: '/connect/login'},
            {icon: 'account_circle', text: '登出', url: '/logout'}
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
        this.inviteList.splice(index, 1)
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

        this.showCallBtn = false
        this.showHangupBtn = true
        this.isCalling = true
        this.receiver = this.session.receiver

        this.$nextTick(function () {
          const size = (this.$refs.square.clientWidth > this.$refs.square.clientHeight)?
            this.$refs.square.clientHeight: this.$refs.square.clientWidth
          this.squareSize = size
          this.board.init(this.session, size - 8)
        })
      },
      onResize: function() {
        if (this.board.canvas) {
          const size = (this.$refs.square.clientWidth > this.$refs.square.clientHeight)?
            this.$refs.square.clientHeight: this.$refs.square.clientWidth
          this.squareSize = size - 8
          this.board.setSize(size - 8)
        }
      },
      changeBrush: function() {
        if (this.brush == 'pencil') this.brush = 'eraser'
        else this.brush = 'pencil'
        this.board.setBrush(this.brush)
      },
      close: async function () { // for both side
        this.showCallBtn = true
        this.showHangupBtn = false
        this.isCalling = false
        this.stream.close()
        this.speech.stopRecognition()
        this.chat = []
      }
    },
    watch: {
      drawMode: function (mode) {
        if (this.board.canvas) this.board.switchMode()
      },
      brushSize: function (size) {
        if (this.board.canvas) this.board.setWidth(size)
      },
      color: function(value) {
        if (this.board.canvas) this.board.setColor(value)
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
        this.board = new Board()
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
        ws.on('speech:local', async (msg) => {
          this.chat.push({isLocal: true, text: msg.data})
        })
        ws.on('speech:remote', async (msg) => {
          this.chat.push({isLocal: false, text: msg.data})
        })
        ws.on('session:close', async (msg) => { // for passive side (w.r.t. hangup)
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