const Router = require('koa-router')

const router = new Router()

router.all('/data', RBAC.auth(true), async (ctx) => {
	console.log(ctx.state.user)
})

module.exports = router