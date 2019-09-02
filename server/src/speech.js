// Imports the Google Cloud client library
const speech = require('@google-cloud/speech')

const request = {
  config: {
    encoding: 'LINEAR16',
    sampleRateHertz: 44100,
    languageCode: 'zh-TW',
  },
  interimResults: false, // If you want interim results, set this to true
};

let clients = {}

// Stream the audio to the Google Cloud Speech API
let recognizeStreams = {}

function startRecognitionStream(id, callback) {
	// Stream the audio to the Google Cloud Speech API
	if (clients[id]) {
		recognizeStreams[id] = clients[id].streamingRecognize(request)
			.on('error', (err) => {
				console.error(err.message)
				stop(id)
			})
			.on('data', (data) => {
				console.log(
					(data.results[0] && data.results[0].alternatives[0])
						? `Transcription: ${data.results[0].alternatives[0].transcript}`
						: `\n\nReached transcription time limit, press Ctrl+C\n`)
					callback(data.results[0].alternatives[0].transcript)

				// if end of utterance, let's restart stream
				// this is a small hack. After 65 seconds of silence, the stream will still throw an error for speech length limit
				if (data.results[0] && data.results[0].isFinal) {
					stop(id)
					// stopRecognitionStream(id)
					// startRecognitionStream(id, callback)
					// console.log('restarted stream serverside')
				}
			})
			.on('end', () => {
				recognizeStreams[id] = null
				clients[id] = null
			})
	}
}

function stopRecognitionStream(id) {
	if (recognizeStreams[id]) {
		recognizeStreams[id].end()
	}
	recognizeStreams[id] = null
}

function writeStream(id, data) {
	if (recognizeStreams[id]) {
		recognizeStreams[id].write(data)
	}
}

function start(id, callback) {
	// Creates a client
	if (!clients[id]) clients[id] = new speech.SpeechClient()
	startRecognitionStream(id, callback)
}

function stop(id) {
	stopRecognitionStream(id)
	clients[id] = null
}

function isStopped(id) {
	return !clients[id]
}

module.exports = {
	start,
	stop,
	write: writeStream,
	isStopped
}