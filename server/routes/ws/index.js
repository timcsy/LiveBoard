const Router = require('koa-router')

const router = new Router()

router.all('/data/:id', RBAC.auth(true), async (ctx) => {
	console.log(ctx.params.id)
})

module.exports = router