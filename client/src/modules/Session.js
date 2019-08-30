import ws from './MainSocket'

class Session {
	constructor() {
		this._receiver = {} // {name, picture}
		this.invitations = []
		ws.on('session:start', msg => this.onStart(msg.data.id))
		ws.on('session:ready', this.onReady)
		ws.on('session:close', this.onClose)
	}

	start() {
		ws.send(JSON.stringify({on: 'session:start'}))
	}

	onStart(session_id) {
		this.id = session_id
		while (this.invitations.length > 0) {
			this.send('session:invite', this.invitations.shift())
		}
	}

	invite(receiver) {
		if (receiver) {
			if (!this.id) {
				this.invitations.push({ to: receiver })
			} else {
				this.send('session:invite', { to: receiver })
			}
		}
	}

	accept(id) {
		this.id = id
		this.send('session:accept')
	}

	get receiver() {
		return this._receiver
	}
	set receiver(receiver) {
		this._receiver = receiver
	}

	send(on, data) {
		ws.send(JSON.stringify({session: this.id, on, data}))
	}

	close() {
		this.id = null
		this.send('session:close')
	}

	onReady(msg) {
		this._receiver = msg.data
	}

	onClose() {
		this._receiver = {}
		ws.close()
	}
}

export default Session