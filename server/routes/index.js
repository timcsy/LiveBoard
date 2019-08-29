const Router = require('koa-router')
const views = require('koa-views')
const path = require('path')

const authRouter = require('./auth')
const dataRouter = require('./data')
const apiRouter = require('./api')

const router = new Router()

router.use(views(path.resolve(__dirname, '../../client/dist'), {
	extension: 'html'
}))

// Auth resource
router.use(authRouter.routes())

// Data resource
router.use(dataRouter.routes())

// API resource
router.use(apiRouter.routes())

module.exports = router