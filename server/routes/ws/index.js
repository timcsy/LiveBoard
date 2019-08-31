const Router = require('koa-router')
const streaming = require('../../src/streaming')
const RBAC = require('../../lib/rbac')
const Local = require('../../models/Auth/Local')
const User = require('../../models/Auth/User')
const Session = require('../../models/Board/Session')

const sockets = {} // to store the incoming socket
const invitations = {} // to store the invitations
const isServerMode = {} // to store the webrtc connection state

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
				console.log(ctx.state.user + message)
				const session = await Session.create()
				session.clients.push(ctx.state.user)
				await session.save()
				ws_self.send(JSON.stringify({ on: 'session:start', data: {id: session._id} }))
			}
		} else {
			const session = await Session.findById(msg.session).exec()
			if (msg.on == 'session:invite') {
				const receiver = await Local.findOne({username: msg.data.to}).exec()
				const user = await User.findById(ctx.state.user).populate('identities').exec()
				const inviter = {
					name: user.identities[0].name || user.identities[0].username,
					picture: user.identities[0].picture
				}
				if (receiver) {
					if (sockets[receiver.user] && sockets[receiver.user].readyState == 1) {
						sockets[receiver.user].send(JSON.stringify({ on: 'session:invite', data: {id: session._id, inviter} }))
					} else {
						if (!invitations[receiver.user]) invitations[receiver.user] = []
						invitations[receiver.user].push({id: session._id, inviter})
					}
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
							console.log(ctx.state.user + message)
							await session.save()
							const user = await User.findById(ctx.state.user).populate('identities').exec()
							const profile = {
								name: user.identities[0].name || user.identities[0].username,
								picture: user.identities[0].picture
							}
							ws.send(JSON.stringify({on: 'session:ready', data: profile}))
						}

						else if (msg.on == 'session:decline') {
							console.log(ctx.state.user + message)
							await Session.deleteOne({ _id: session._id }).exec()
							ws.send(JSON.stringify({on: 'session:close'}))
						}

						else if (msg.on == 'webrtc:start') {
							console.log(ctx.state.user + message)
							ws.send(JSON.stringify({on: 'webrtc:start'}))
						}

						else if (msg.on == 'webrtc:ready') {
							console.log(ctx.state.user + message)
							ws.send(JSON.stringify({on: 'webrtc:ready'}))
						}

						else if (msg.on == 'webrtc:offer') {
							console.log(ctx.state.user + message)
							ws.send(JSON.stringify({on: 'webrtc:offer', data: {sdp: msg.data.sdp}}))
						}

						else if (msg.on == 'webrtc:answer') {
							console.log(ctx.state.user + message)
							ws.send(JSON.stringify({on: 'webrtc:answer', data: {sdp: msg.data.sdp}}))
						}

						else if (msg.on == 'webrtc:ice') {
							console.log(ctx.state.user + message)
							ws.send(JSON.stringify({on: 'webrtc:ice', data: {ice: msg.data.ice}}))
						}

						else if (msg.on == 'webrtc:disconnected') {
							console.log(ctx.state.user + message)
							isServerMode[session._id] = true
						}

						else if (msg.on == 'speech:start') {
							console.log(ctx.state.user + message)
							const id = session._id + ctx.state.user
							streaming.start(id, function(text) {
								ws_self.send(JSON.stringify({on: 'speech:local', data: text}))
								ws.send(JSON.stringify({on: 'speech:remote', data: text}))
							})
						}

						else if (msg.on == 'speech:data') {
							console.log(ctx.state.user + ', on: speech:data, time: ' + msg.data.time)
							const id = session._id + ctx.state.user
							if (streaming.isStopped(id)) streaming.start(id, function(text) {
								ws_self.send(JSON.stringify({on: 'speech:local', data: text}))
								ws.send(JSON.stringify({on: 'speech:remote', data: text}))
							})
							streaming.onData(id, msg.data.data)
							if (isServerMode[session._id])
								ws.send(JSON.stringify({on: 'speech:data', data: {data: msg.data.data}}))
						}

						else if (msg.on == 'canvas:render') {
							console.log(ctx.state.user + message)
							ws.send(JSON.stringify({on: 'canvas:render', data: msg.data}))
						}

						else if (msg.on == 'session:close') {
							console.log(ctx.state.user + message)
							const id = session._id + ctx.state.user
							streaming.stop(id)
							isServerMode[session._id] = undefined
							ws.send(JSON.stringify({on: 'session:close'}))
							const remote_id = session._id + receiver
							streaming.stop(remote_id)
						}

					}
				}
			}
		}
	})
})

module.exports = router