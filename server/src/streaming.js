const speech = require('./speech')
const atob = require('atob')
const btoa = require('btoa')

function start(id, callback) {
	speech.start(id, callback)
}

function onData(id, data) {
	const data16 = downsampleBuffer(btof(data), 44100, 44100)
	// console.log(new Int16Array(data16))
	speech.write(id, new Uint8Array(data16))
}

function stop(id) {
	speech.stop(id)
}

function isStopped(id) {
	return speech.isStopped(id)
}

function downsampleBuffer(buffer, sampleRate, outSampleRate) {
	if (outSampleRate > sampleRate) {
		throw "downsampling rate show be smaller than original sample rate"
	}
	const sampleRateRatio = sampleRate / outSampleRate
	const newLength = Math.round(buffer.length / sampleRateRatio)
	const result = new Int16Array(newLength);
	let offsetResult = 0
	let offsetBuffer = 0
	while (offsetResult < result.length) {
		var nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio)
		let accum = 0, count = 0
		for (var i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
			accum += buffer[i]
			count++
		}

		result[offsetResult] = Math.min(1, accum / count) * 0x7FFF
		offsetResult++
		offsetBuffer = nextOffsetBuffer
	}
	return result.buffer
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

module.exports = {
	start,
	onData,
	stop,
	isStopped,
	downsampleBuffer,
	bufferToBase64,
	base64ToBuffer,
	ftob,
	btof
}