const Router = require('koa-router')
const RBAC = require('../../lib/rbac')

const router = new Router()

router.get('/board', async (ctx) => {
	await ctx.render('board/index')
	// if (ctx.isAuthenticated()) {
	// 	await ctx.render('board/index')
	// } else {
	// 	ctx.redirect('/')
	// }
})

module.exports = router