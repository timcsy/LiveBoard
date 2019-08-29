let ws = new WebSocket(WS_HOST + '/data/')

async function changeName() {
	ws.close()
	const name = document.getElementById("name").value
	console.log(name)
	// WebSocket
	ws = new WebSocket(WS_HOST + '/data/' + name)
	ws.onmessage = async (e) => {
		const message = e.data
		const msg = JSON.parse(message)
		// console.log(msg)
		if (msg.cmd === 'after:render') {
			afterRender(msg)
		} else if (msg.cmd === 'ready') {
      await prepareSendOffer()
    } else if (msg.type === 'offer') {
      receiveOffer(new RTCSessionDescription(msg.sdp), msg.sendFrom)
    } else if (msg.type === 'answer') {
      receiveAnswer(new RTCSessionDescription(msg.sdp))
    } else if (msg.type === 'ice') {
      receiveICE(new RTCIceCandidate(msg.ice))
    } else if (msg.type === 'disconnected') {
			isServerMode = true
		} else if (msg.cmd === 'speech:start') {
			await call(true, msg.sendFrom)
		} else if (msg.cmd === 'speech:data') {
			play(btof(msg.data))
		} else if (msg.cmd === 'speech:local') {
			showLocalSpeech(msg)
		} else if (msg.cmd === 'speech:remote') {
			showRemoteSpeech(msg)
		} else if (msg.cmd === 'speech:stop') {
			await hangup(true)
		}
	}
}