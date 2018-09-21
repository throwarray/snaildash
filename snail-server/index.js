const path = require('path')
const resourcePath = global.GetResourcePath ?
	global.GetResourcePath(global.GetCurrentResourceName()):
	__dirname

const safepath = url => path.join(resourcePath, url)

require('dotenv').config({ path: safepath('./server/.env') })

const env = process.env
const port = parseInt(env.PORT, 10) || 3000
const dev = env.NODE_ENV == 'development'

let next
let app
let handle

if (dev) {
	next = require('next')
	app = next({ dev })
	handle = app.getRequestHandler()
}

const mongoose = require('mongoose')
const express = require('express')
const router = express()
const server = require('http').createServer(router)
// const io = require('socket.io')(server, { serveClient: false })

const cfg = {
	// io,
	app,
	server,
	router,
	resourcePath,
	env: env.NODE_ENV
}

if (!process.env.MONGO_URL) throw new Error('MISSING ENV VARIABLE [MONGO_URL]')

require(safepath('./server/auth.js'))(cfg)

//require(safepath('./server/io.js'))(cfg)

router.use(require(safepath('./server/routes.js')))

if (dev)
	router.get('/*', function (req, res) { handle(req, res) })
else
	router.use(express.static(safepath('./out')))

Promise.resolve(dev? app.prepare() : true).then(() => {
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
