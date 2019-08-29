import { WS_HOST } from '../../config'

class MainSocket {
	constructor() {
		this.msgs = new Array()
		this.callbacks = {}
		this.init()
	}

	init() {
		this.ws = new WebSocket(WS_HOST + '/data')
		this.ws.onmessage = async (e) => {
			const message = e.data
			const msg = JSON.parse(message)
			// console.log(msg)
			this.callbacks[msg.on].forEach(async(callback) => await callback(msg))
		}

		this.ws.onopen = () => {
			while (this.msgs.length > 0) {
        this.ws.send(this.msgs.shift())
      }
		}
	}

	send(data) {
		this.msgs.push(data)
		if (this.ws.readyState !== OPEN) {
			this.msgs.push(data)
		} else {
			this.ws.send(data)
		}
		if (this.ws.readyState === WebSocket.CLOSED) {
			this.init()
		}
	}

	close(code, reason) {
		this.ws.close(code, reason)
	}

	on(on, callback) {
		if (!this.callbacks[on]) this.callbacks[on] = new Array()
		this.callbacks[on].push(callback)
	}
}

export default new MainSocket()