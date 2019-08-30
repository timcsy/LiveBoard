const Router = require('koa-router')
const RBAC = require('../../lib/rbac')
const Local = require('../../models/Auth/Local')
const Identity = require('../../models/Auth/Identity')
const Session = require('../../models/Board/Session')

const sockets = {} // to store the incoming socket
const invitations = {}

const router = new Router()

router.all('/data', RBAC.auth(), async (ctx) => {
	console.log(ctx.state.user)
	sockets[ctx.state.user] = ctx.websocket
	const ws_self = sockets[ctx.state.user]
	ctx.websocket.on('open', function() {
		if (invitations[rctx.state.user].length > 0) {
			invitations[ctx.state.user].forEach(invitation => {
				ws_self.send(JSON.stringify({ on: 'session:invite', data: invitation }))
			})
			invitations[ctx.state.user].length = 0
		}
	})
	ctx.websocket.on('message', async function(message) {
		// do something with the message from client
		const msg = JSON.parse(message)
		// if it is not session
		if (!msg.session) {
			if (msg.on == 'session:start') {
				const session = await Session.create()
				session.clients.push(ctx.state.user)
				await session.save()
				ws_self.send(JSON.stringify({ on: 'session:start', data: {id: session._id} }))
			}
		} else {
			const session = await Session.findById(msg.session).exec()
			if (msg.on == 'session:invite') {
				const receiver = await Local.findOne({username: msg.to}).exec()
				const user = await User.findById(ctx.state.user).populate('identities').exec()
				const inviter = {
					name: user.identities[0].name || user.identities[0].username,
					picture: user.identities[0].picture
				}
				if (sockets[receiver.user] && sockets[receiver.user].readyState == 1) {
					sockets[receiver.user].send(JSON.stringify({ on: 'session:invite', data: {id: session._id, inviter} }))
				} else {
					if (!invitations[receiver.user]) invitations[receiver.user] = []
					invitations[receiver.user].push({id: session._id, inviter})
				}
			} else {
				if (msg.on == 'session:accept') session.clients.push(ctx.state.user)

				let receiver
				for (let client of session.clients) {
					if (client != ctx.state.user) {
						receiver = client
						break
					}
				}
				if (receiver) {
					const ws = sockets[receiver]
					if (ws && ws.readyState == 1) {
						if (msg.on == 'session:accept') {
							await session.save()
							const user = await User.findById(ctx.state.user).populate('identities').exec()
							const profile = {
								name: user.identities[0].name || user.identities[0].username,
								picture: user.identities[0].picture
							}
							ws.send(JSON.stringify({on: 'session:ready', data: profile}))
						}
					}
				}
			}
		}
		console.log(message)
	})
})

module.exports = router