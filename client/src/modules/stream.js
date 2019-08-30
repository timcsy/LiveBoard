import ws from './socket'

class LiveStream {
  constructor(localStream, receiver) {
    this.localStream = localStream
    this.receiver = receiver
    this.isServerMode = false

    // STUN / TURN Server
    this.configuration = {
      'iceServers': [
        {
          'urls': 'stun:stun.l.google.com:19302'
        }
      ]
    }
    this.offerOptions = {
      offerToReceiveAudio: 1
    }

    ws.on('webrtc:ready', this.sendOffer)
    ws.on('webrtc:offer', this.receiveOffer)
    ws.on('webrtc:answer', this.receiveAnswer)
  }

  start(caller) {
    if (caller) {
      this.receiver = caller
      ws.send(JSON.stringify({to: caller, on: 'ready'}))
    }
  }

  close() {
    // Ending call
    this.pc.close()
    this.pc = null
  }

  createPeerConnection() {
    if (!this.pc) {
      // Create local peer connection object pc1
      this.pc = new RTCPeerConnection(this.configuration)
      this.pc.addEventListener('icecandidate', this.onIceCandidate)
      this.pc.addEventListener('iceconnectionstatechange', this.onIceStateChange)
      this.pc.addEventListener('track', this.gotRemoteStream)
      // Add local stream to pc
      this.localStream.getTracks().forEach(track => this.pc.addTrack(track, this.localStream))
    }
  }

  async sendOffer(msg) {
    // Starting call
    if (!this.pc) this.createPeerConnection()

    try {
      const offer = await this.pc.createOffer(this.offerOptions)
      try {
        await this.pc.setLocalDescription(offer)
        console.log(`pc setLocalDescription complete`)
      } catch (e) {
        console.error(`Failed to set session description: ${e.toString()}`)
      }
  
      // send sdp
      ws.send(JSON.stringify({to: this.receiver, on: 'webrtc:offer', data: {sdp: offer.toJSON()}}))
    } catch (e) {
      console.error(`Failed to create session description: ${e.toString()}`)
    }
  }

  async receiveOffer(msg) {
    const desc = new RTCSessionDescription(msg.sdp)
    const sendFrom = msg.sendFrom

    if (!this.pc) this.createPeerConnection()
  
    try {
      await this.pc.setRemoteDescription(desc)
      console.log(`pc setRemoteDescription complete`)
    } catch (e) {
      console.error(`Failed to set session description: ${e.toString()}`)
    }
  
    // pc createAnswer start
    // Since the 'remote' side has no media stream we need
    // to pass in the right constraints in order for it to
    // accept the incoming offer of audio and video.
    try {
      const answer = await this.pc.createAnswer()
      await this.sendAnswer(answer, sendFrom)
    } catch (e) {
      console.error(`Failed to set session description: ${e.toString()}`)
    }
  }

  async sendAnswer(desc, sendFrom) {
    try {
      await this.pc.setLocalDescription(desc)
      console.log(`pc setLocalDescription complete`)
  
      // send sdp
      const msg = {to: sendFrom, on: 'webrtc:answer', data: {sdp: desc.toJSON()}}
      ws.send(JSON.stringify(msg))
    } catch (e) {
      console.error(`Failed to set session description: ${e.toString()}`)
    }
  }

  async receiveAnswer(msg) {
    const desc = new RTCSessionDescription(msg.sdp)

    if (!this.pc) await this.createPeerConnection()
  
    try {
      await this.pc.setRemoteDescription(desc)
      console.log(`pc setRemoteDescription complete`)
    } catch (e) {
      console.error(`Failed to set session description: ${e.toString()}`)
    }
  }

  sendICE(ice) {
    const msg = {to: this.receiver, on: 'webrtc:ice', data: {ice: ice.toJSON()}}
    ws.send(JSON.stringify(msg))
  }
  
  async receiveICE(msg) {
    const ice = new RTCIceCandidate(msg.ice)

    if (!this.pc) this.createPeerConnection()
  
    try {
      await this.pc.addIceCandidate(ice)
      console.log(`pc addIceCandidate success`)
    } catch (e) {
      console.error(`Failed to set session description: ${e.toString()}`)
    }
  }

  onIceCandidate(event) {
    if (event.candidate) this.sendICE(event.candidate)
    console.log(`pc ICE candidate:\n${event.candidate? event.candidate.candidate: '(null)'}`)
  }

  onIceStateChange(event) {
    if (this.pc) {
      console.log(`pc ICE state: ${this.pc.iceConnectionState}`)
      console.log(event)
      if (this.pc.iceConnectionState === 'disconnected') {
        ws.send(JSON.stringify({to: this.receiver, on: 'webrtc:disconnected'}))
      } else if (this.pc.iceConnectionState === 'connected') {
        this.isServerMode = false
      }
    }
  }

  playRemoteStream(e) {
    const remoteAudio = document.createElement('audio')
    remoteAudio.setAttribute('autoplay', true)
    if (remoteAudio.srcObject !== e.streams[0]) {
      remoteAudio.srcObject = e.streams[0]
      console.log('pc received remote stream')
    }
  }
}

export default LiveStream

async function call(passive, caller) {
  // Requesting local stream
  await startRecognition(passive)

}

async function hangup(passive) {
  await stopRecognition(passive)
}