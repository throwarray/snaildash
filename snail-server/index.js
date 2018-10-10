require(require.resolve('./server/compat.js'))

const env = process.env
const port = parseInt(env.PORT, 10) || 3000
const dev = env.NODE_ENV == 'development'

if (!dev) require('dotenv').config({ path: './server/.env' })

const mongoose = require('mongoose')
const express = require('express')
const router = express()
const compression = require('compression')
const server = require('http').createServer(router)

const next = require('next')
const app = next({ dev })
const handle = app.getRequestHandler()

// const io = require('socket.io')(server, { serveClient: false })

const cfg = {
	// io,
	app,
	server,
	router,
	resourcePath: __dirname,
	env: env.NODE_ENV
}

if (!process.env.MONGO_URL) throw new Error('MISSING ENV VARIABLE [MONGO_URL]')

require('./server/auth.js')(cfg)

// require('./server/io.js')(cfg)

router.use(require('./server/routes.js'))

if (!dev) {
	router.use(compression())
	router.use(express.static('./out'))
}

router.get('/*', function (req, res) { handle(req, res) })

Promise.resolve(app.prepare()).then(() => {
	return mongoose.connect(env.MONGO_URL, { useNewUrlParser: true })
}, err => {
	throw err
})

mongoose.connection.once('open', function () {
	server.listen(port, (err) => {
		if (err) throw err

		console.log(`> Ready on http://localhost:${port}`)
	})
})
