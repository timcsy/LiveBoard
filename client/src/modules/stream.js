const callButton = document.getElementById('callButton')
const hangupButton = document.getElementById('hangupButton')
const remoteAudio = document.getElementById('remoteAudio')
callButton.disabled = false
hangupButton.disabled = true

let localStream
let pc
let isServerMode = false
// STUN / TURN Server
const configuration = {
  'iceServers': [
    {
      'urls': 'stun:stun.l.google.com:19302'
    }
  ]
}
const offerOptions = {
  offerToReceiveAudio: 1
}

async function createPeerConnection() {
  if (!pc) {
    // Create local peer connection object pc1
    pc = new RTCPeerConnection(configuration)
    pc.addEventListener('icecandidate', onIceCandidate)
    pc.addEventListener('iceconnectionstatechange', onIceStateChange)
    pc.addEventListener('track', gotRemoteStream)
    // Add local stream to pc
    localStream.getTracks().forEach(track => pc.addTrack(track, localStream))
  }
}

async function sendOffer() {
  try {
    const offer = await pc.createOffer(offerOptions)
    try {
      await pc.setLocalDescription(offer)
      console.log(`pc setLocalDescription complete`)
    } catch (e) {
      console.error(`Failed to set session description: ${e.toString()}`)
    }

    // send sdp
    const receiver = document.getElementById("receiver").value
    const msg = {to: receiver, type: 'offer', sdp: offer.toJSON()}
    ws.send(JSON.stringify(msg))
  } catch (e) {
    console.error(`Failed to create session description: ${e.toString()}`)
  }
}

async function receiveOffer(desc, sendFrom) {
  if (!pc) await createPeerConnection()

  try {
    await pc.setRemoteDescription(desc)
    console.log(`pc setRemoteDescription complete`)
  } catch (e) {
    console.error(`Failed to set session description: ${e.toString()}`)
  }

  // pc createAnswer start
  // Since the 'remote' side has no media stream we need
  // to pass in the right constraints in order for it to
  // accept the incoming offer of audio and video.
  try {
    const answer = await pc.createAnswer()
    await sendAnswer(answer, sendFrom)
  } catch (e) {
    console.error(`Failed to set session description: ${e.toString()}`)
  }
}

async function sendAnswer(desc, sendFrom) {
  try {
    await pc.setLocalDescription(desc)
    console.log(`pc setLocalDescription complete`)

    // send sdp
    const msg = {to: sendFrom, type: 'answer', sdp: desc.toJSON()}
    ws.send(JSON.stringify(msg))
  } catch (e) {
    console.error(`Failed to set session description: ${e.toString()}`)
  }
}

async function receiveAnswer(desc) {
  if (!pc) await createPeerConnection()

  try {
    await pc.setRemoteDescription(desc)
    console.log(`pc setRemoteDescription complete`)
  } catch (e) {
    console.error(`Failed to set session description: ${e.toString()}`)
  }
}

async function sendICE(ice) {
  const receiver = document.getElementById("receiver").value
  const msg = {to: receiver, type: 'ice', ice: ice.toJSON()}
  ws.send(JSON.stringify(msg))
}

async function receiveICE(ice) {
  if (!pc) await createPeerConnection()

  try {
    await pc.addIceCandidate(ice)
    console.log(`pc addIceCandidate success`)
  } catch (e) {
    console.error(`Failed to set session description: ${e.toString()}`)
  }
}

async function start(passive) {
  // Requesting local stream
  await startRecognition(passive)
}

async function call(passive, caller) {
  await start(passive)
  callButton.disabled = true
	hangupButton.disabled = false

  if (passive) {
    document.getElementById("receiver").value = caller
    ws.send(JSON.stringify({to: caller, cmd: 'ready'}))
  }
}

async function prepareSendOffer() {
  // Starting call
  if (!pc) await createPeerConnection()
  sendOffer()
}

function gotRemoteStream(e) {
  if (remoteAudio.srcObject !== e.streams[0]) {
    remoteAudio.srcObject = e.streams[0]
    console.log('pc received remote stream')
  }
}

async function onIceCandidate(event) {
  if (event.candidate) sendICE(event.candidate)
  console.log(`pc ICE candidate:\n${event.candidate? event.candidate.candidate: '(null)'}`)
}

function onIceStateChange(event) {
  if (pc) {
    console.log(`pc ICE state: ${pc.iceConnectionState}`)
    console.log(event)
    if (pc.iceConnectionState === 'disconnected') {
      const receiver = document.getElementById("receiver").value
      ws.send(JSON.stringify({to: receiver, type: 'disconnected'}))
    } else if (pc.iceConnectionState === 'connected') {
      isServerMode = false
    }
  }
}

async function hangup(passive) {
  await stopRecognition(passive)
  // Ending call
  pc.close()
  pc = null
  hangupButton.disabled = true
  callButton.disabled = false
}