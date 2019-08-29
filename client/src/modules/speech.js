const INPUT_BUFFER_SIZE = 16384
const BUFFER_NUM = 1
const AudioContext = window.AudioContext || window.webkitAudioContext
let audioCtx
let inputProcessor
let input
let startTime
let timeOffset

async function startRecognition(passive) {
	try {
		audioCtx = new AudioContext()
		inputProcessor = audioCtx.createScriptProcessor(INPUT_BUFFER_SIZE, 1, 1)
		inputProcessor.connect(audioCtx.destination)

		// Requesting local stream
    const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: false})
    // Received local stream
		localStream = stream

		input = audioCtx.createMediaStreamSource(stream)
		input.connect(inputProcessor)

		let bufPos = 0
		let buf
		inputProcessor.onaudioprocess = function (e) {
			if (!buf) buf = new Float32Array(INPUT_BUFFER_SIZE * BUFFER_NUM)
			const left = e.inputBuffer.getChannelData(0)
			buf.set(left, INPUT_BUFFER_SIZE * bufPos)
			bufPos++
			if (bufPos == BUFFER_NUM) {
				const currentTimeOffset = Date.now() - startTime
				const data = ftob(buf) // Convert the Float32Array to base64
				const receiver = document.getElementById("receiver").value
				ws.send(JSON.stringify({to: receiver, cmd: 'speech:data', data: data, time: timeOffset}))
				bufPos = 0
				timeOffset = currentTimeOffset
			}
		}
		startTime = Date.now()
		timeOffset = 0
		if (!passive) {	
			const receiver = document.getElementById("receiver").value
			ws.send(JSON.stringify({to: receiver, cmd: 'speech:start', time: startTime}))
		}
  } catch (e) {
		alert(`error: ${e.name}`)
		console.error(e)
  }
}

async function stopRecognition(passive) {
	if (!passive) {
		const receiver = document.getElementById("receiver").value
		ws.send(JSON.stringify({to: receiver, cmd: 'speech:stop'}))
	}

	let track = localStream.getTracks()[0]
	track.stop()

	input.disconnect(inputProcessor)
	inputProcessor.disconnect(audioCtx.destination)
	await audioCtx.close()
	input = null
	inputProcessor = null
}

function addLocalSpeech(text) {
	const room = document.getElementById('room')
	const item = document.createElement('div');
	item.setAttribute('style', 'background-color: #fff');
	item.textContent = text
	room.appendChild(item)
	room.scrollTop = room.scrollHeight
}

function showLocalSpeech(msg) {
	addLocalSpeech(msg.data)
}

function addRemoteSpeech(text) {
	const room = document.getElementById('room')
	const item = document.createElement('div');
	item.setAttribute('style', 'background-color: #ccc');
	item.textContent = text
	room.appendChild(item)
	room.scrollTop = room.scrollHeight
}

function showRemoteSpeech(msg) {
	addRemoteSpeech(msg.data)
}


function play(buf) {
	// Get an AudioBufferSourceNode.
	// This is the AudioNode to use when we want to play an AudioBuffer
	const source = audioCtx.createBufferSource()
	const audioBuf = audioCtx.createBuffer(2, buf.length, 44100)
	audioBuf.getChannelData(0).set(buf)
	audioBuf.getChannelData(1).set(buf)
	// set the buffer in the AudioBufferSourceNode
	source.buffer = audioBuf
	// connect the AudioBufferSourceNode to the
	// destination so we can hear the sound
	source.connect(audioCtx.destination)
	// start the source playing
	source.start()
}

function bufferToBase64(buf) {
	const binstr = Array.prototype.map.call(buf, function (ch) {
		return String.fromCharCode(ch)
	}).join('')
	return btoa(binstr)
}
function base64ToBuffer(base64) {
	var binstr = atob(base64)
	var buf = new Uint8Array(binstr.length)
	Array.prototype.forEach.call(binstr, function (ch, i) {
		buf[i] = ch.charCodeAt(0)
	})
	return buf
}
function ftob(floatArr) {
	return bufferToBase64(new Uint8Array(floatArr.buffer))
}
function btof(base64) {
	return new Float32Array(base64ToBuffer(base64).buffer)
}
