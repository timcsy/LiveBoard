const Router = require('koa-router')
const RBAC = require('../../lib/rbac')

const router = new Router()

router.get('/board', RBAC.auth(true), async (ctx) => {
	await ctx.render('board/index')
})

module.exports = router