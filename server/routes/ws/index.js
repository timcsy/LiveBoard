const Router = require('koa-router')
const RBAC = require('../../lib/rbac')

const router = new Router()

router.all('/data', RBAC.auth(), async (ctx) => {
	console.log(ctx.state.user)
	ctx.websocket.on('message', function(message) {
		console.log(message)
	})
})

module.exports = router