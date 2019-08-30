import ws from './MainSocket'

const INPUT_BUFFER_SIZE = 16384
const BUFFER_NUM = 1
const AudioContext = window.AudioContext || window.webkitAudioContext

class Speech {
	constructor() {
		ws.on('speech:data', msg => this.play(btof(msg.data.data)))
	}

	init(session, stream) {
		this.session = session
		this.stream = stream
	}

	async startRecognition() {
		try {
			this.audioCtx = new AudioContext()
			this.inputProcessor = this.audioCtx.createScriptProcessor(INPUT_BUFFER_SIZE, 1, 1)
			this.inputProcessor.connect(this.audioCtx.destination)

			this.input = this.audioCtx.createMediaStreamSource(this.stream)
			this.input.connect(this.inputProcessor)

			let bufPos = 0
			let buf
			this.inputProcessor.onaudioprocess = e => {
				if (!buf) buf = new Float32Array(INPUT_BUFFER_SIZE * BUFFER_NUM)
				const left = e.inputBuffer.getChannelData(0)
				buf.set(left, INPUT_BUFFER_SIZE * bufPos)
				bufPos++
				if (bufPos == BUFFER_NUM) {
					const currentTimeOffset = Date.now() - this.startTime
					const data = ftob(buf) // Convert the Float32Array to base64
					this.session.send('speech:data', {data, time: this.timeOffset})
					bufPos = 0
					this.timeOffset = currentTimeOffset
				}
			}
			this.startTime = Date.now()
			this.timeOffset = 0
			this.session.send('speech:start', {time: this.startTime})
		} catch (e) {
			alert(`error: ${e.name}`)
			console.error(e)
		}
	}

	async stopRecognition() {
		let track = this.stream.getTracks()[0]
		track.stop()

		this.input.disconnect(this.inputProcessor)
		this.inputProcessor.disconnect(this.audioCtx.destination)
		await this.audioCtx.close()
		this.input = null
		this.inputProcessor = null
	}

	play(buf) {
		// Get an AudioBufferSourceNode.
		// This is the AudioNode to use when we want to play an AudioBuffer
		const source = this.audioCtx.createBufferSource()
		const audioBuf = this.audioCtx.createBuffer(2, buf.length, 44100)
		audioBuf.getChannelData(0).set(buf)
		audioBuf.getChannelData(1).set(buf)
		// set the buffer in the AudioBufferSourceNode
		source.buffer = audioBuf
		// connect the AudioBufferSourceNode to the
		// destination so we can hear the sound
		source.connect(this.audioCtx.destination)
		// start the source playing
		source.start()
	}

	addLocalSpeech(text) {
		const room = document.getElementById('room')
		const item = document.createElement('div');
		item.setAttribute('style', 'background-color: #fff');
		item.textContent = text
		room.appendChild(item)
		room.scrollTop = room.scrollHeight
	}

	showLocalSpeech(msg) {
		addLocalSpeech(msg.data)
	}

	addRemoteSpeech(text) {
		const room = document.getElementById('room')
		const item = document.createElement('div');
		item.setAttribute('style', 'background-color: #ccc');
		item.textContent = text
		room.appendChild(item)
		room.scrollTop = room.scrollHeight
	}

	showRemoteSpeech(msg) {
		addRemoteSpeech(msg.data)
	}
}

export default Speech


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
