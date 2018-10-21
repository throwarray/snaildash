const WebSocket = require('ws')
const passport = require('passport')
const { Player, GetPlayerInstances } = require('./cfx/utils.js')

module.exports = function (cfg) {
	const { sessionParser } = cfg
	const NOOP = ()=> {}
	const wss = new WebSocket.Server({
		server: cfg.server,
		perMessageDeflate: false,

		// Accept authenticated users
		verifyClient: (info, done) => {
			sessionParser(info.req, {}, () => {
				const req = info.req

				req.sessionStore.get(req.sessionID, function (err, session) {
					if (err || !session) done(false)
					else {
						const user = session.passport && session.passport.user

						passport.deserializeUser(user, req, function(err, user) {
							if (err || !user) done(false)

							req.user = user
							req.logged_in = true

							done(true)
						})
					}
				})
			})
		}
	})

	// Add broadcast method
	wss.broadcast = function (data) {
		wss.clients.forEach(function (client) {
			if (client.readyState === WebSocket.OPEN) client.send(data)
		})
	}

	// Detect and close broken connections
	function heartbeat () { this.isAlive = true }

	setInterval(function () {
		wss.clients.forEach(function (ws) {
			if (ws.isAlive === false) {
				// console.log('ws disconnection from', ws.remoteAddress)

				return ws.terminate()
			}

			ws.isAlive = false
			ws.ping(NOOP)
		})
	}, 15000)


	// Drop logged out user
	cfg.handleLogout = function (req) {
		const sessionID = req.sessionID

		for(let client of wss.clients) {
			if (client.sessionID === sessionID) {
				// console.log('ws disconnection from', client.remoteAddress)

				client.terminate()

				break
			}
		}
	}

	// A user connected
	wss.on('connection', function (ws, req) {
		const ip = req.connection.remoteAddress
		// const license = req.user.license

		const isAdmin = req.user && req.user.isAdmin

		ws.remoteAddress = ip
		ws.sessionID = req.sessionID
		ws.isAlive = true

		ws.on('pong', heartbeat)

		ws.on('message', function (message) {
			// Refresh session
			// req.sessionStore.get(req.sessionID, function (err, session) {
			// 	if (err || !session) ws.close()
			// 	else onMessage()
			// })

			if (typeof message === 'string')
			{
				let action
				try {
					action = JSON.parse(message)
				}
				catch(e) {
					return
				}

				if (action) {
					// Received kick player
					if (action.type === 'dropPlayer') {
						const src = action.payload

						setImmediate(function () {
							if (global.GetNumPlayerIdentifiers(src)) {
								// const player = Player(src)

								if (isAdmin) { // NOTE not refreshing isAdmin
									// console.log('kicking player', player.name)

									global.DropPlayer(src, 'You were kicked from the game.')
								}
							}
						})
					}
				}
			}
		})

		// console.log('ws connection from', ip)

		// Broadcast initial player list
		ws.send(JSON.stringify({
			type: 'init',
			payload: {
				players: global.onNet? GetPlayerInstances() : []
			}
		}))
	})

	// Broadcast player joined | dropped events
	setImmediate(function () {
		if (!global.onNet) return

		global.onNet('playerDropped', function () {
			const src = global.source

			wss.broadcast(JSON.stringify({
				type: 'playerDropped',
				payload: Player(src)
			}))
		})

		// global.onNet('hardcap:playerActivated', function () {
		// 	const src = global.source
		//
		// 	wss.broadcast(JSON.stringify({
		// 		type: 'playerActivated',
		// 		payload: Player(src)
		// 	}))
		// })

		global.onNet('playerConnecting', function () {
			const src = global.source

			wss.broadcast(JSON.stringify({
				type: 'playerConnecting',
				payload: Player(src)
			}))
		})
	})

	Object.assign(cfg, { wss })
}
