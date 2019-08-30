import ws from './MainSocket'

class LiveStream {
  constructor() {
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

    ws.on('webrtc:start', msg => this.start())
    ws.on('webrtc:ready', msg => this.sendOffer())
    ws.on('webrtc:offer', msg => this.receiveOffer(msg.data.sdp))
    ws.on('webrtc:answer', msg => this.receiveAnswer(msg.data.sdp))
    ws.on('webrtc:ice', msg => this.receiveICE(msg.data.sdp))
  }

  init(session, localStream) {
    this.localStream = localStream
    this.session = session
  }

  start() {
    this.session.send('webrtc:ready')
  }

  close() {
    // Ending call
    if (this.pc) this.pc.close()
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

  async sendOffer() {
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
      this.session.send('webrtc:offer', { sdp: offer.toJSON() })
    } catch (e) {
      console.error(`Failed to create session description: ${e.toString()}`)
    }
  }

  async receiveOffer(sdp) {
    const desc = new RTCSessionDescription(sdp)

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
      await this.sendAnswer(answer)
    } catch (e) {
      console.error(`Failed to set session description: ${e.toString()}`)
    }
  }

  async sendAnswer(desc) {
    try {
      await this.pc.setLocalDescription(desc)
      console.log(`pc setLocalDescription complete`)
  
      // send sdp
      this.session.send('webrtc:answer', { sdp: desc.toJSON() })
    } catch (e) {
      console.error(`Failed to set session description: ${e.toString()}`)
    }
  }

  async receiveAnswer(sdp) {
    const desc = new RTCSessionDescription(sdp)

    if (!this.pc) await this.createPeerConnection()
  
    try {
      await this.pc.setRemoteDescription(desc)
      console.log(`pc setRemoteDescription complete`)
    } catch (e) {
      console.error(`Failed to set session description: ${e.toString()}`)
    }
  }

  sendICE(ice) {
    this.session.send('webrtc:ice', { ice: ice.toJSON() })
  }
  
  async receiveICE(ice) {
    const ICE = new RTCIceCandidate(ice)

    if (!this.pc) this.createPeerConnection()
  
    try {
      await this.pc.addIceCandidate(ICE)
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
        this.session.send('webrtc:disconnected')
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