import ws from './MainSocket'

class Session {
	constructor() {
		this.receiver = {} // {name, picture}
		this.invitations = []
		ws.on('session:start', this.onStart)
		ws.on('session:ready', this.onReady)
		ws.on('session:close', this.onClose)
	}

	start() {
		ws.send(JSON.stringify({on: 'session:start'}))
	}

	onStart(msg) {
		this.id = msg.data.id
		while (this.invitations.length > 0) {
			this.send('session:invite', this.invitations.shift())
		}
	}

	invite(receiver) {
		if (!this.id) {
			this.invitations.push({ to: receiver })
		} else {
			this.send('session:invite', { to: receiver })
		}
	}

	accept(id) {
		this.id = id
		this.send('session:accept')
	}

	send(on, data) {
		ws.send(JSON.stringify({session: this.id, on, data}))
	}

	close() {
		this.id = null
		this.send('session:close')
	}

	onReady(msg) {
		this.receiver = msg.data
	}

	onClose() {
		this.receiver = {}
		ws.close()
	}
}

export default Session