const Koa = require('koa')
const session = require('koa-session')
const bodyParser = require('koa-bodyparser')
const passport = require('./lib/passort')
const router = require('./routes')
const static = require('koa-static')
const path = require('path')
const config = require('./config/server')

const app = new Koa()

// sessions
app.keys = config.SESSION_KEYS
app.use(session(app))

// body parser
app.use(bodyParser())

// // auth
app.use(passport.initialize())
app.use(passport.session())

// routes
app.use(router.routes())

// static routes
app.use(static(path.resolve(__dirname, '../client/dist')))

// server
app.listen(80, () => {
	console.log('Remember to open MongoDB server: npm run db')
	console.log('Remember to setup at first time: npm run setup')
	console.log('Server is running at http://localhost')
})