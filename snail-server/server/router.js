const mongoose = require('mongoose')
const { Router } = require('express')
const { GetPlayerLicense, getPlayerRemotes } = require('./cfx/utils.js')
const router = Router()
const PlayerRemotes = getPlayerRemotes()
const bodies = require('body-parser')

router.use(bodies.urlencoded({ extended: true }))
router.use(bodies.json())

const refreshPlayer = ()=> {
	const src = global.source
	const license = GetPlayerLicense(src)
	if (license) delete PlayerRemotes[license]

	return license
}

if (global.RegisterNetEvent) {
	// CFX-Client dropped
	global.RegisterNetEvent('playerDropped')
	global.onNet('playerDropped', refreshPlayer)

	// CFX-Client ready
	global.RegisterNetEvent('hardcap:playerActivated')
	global.onNet('hardcap:playerActivated', function () {
		const src = global.source
		const license = refreshPlayer()

		mongoose.model('User').findOne({ license }, function (err, user) {
			setImmediate(function () {
				global.emitNet('snaildash:Welcome', src, !!user,
					!!(user && user.verified)
				)
			})
		})
	})
}

module.exports = function (cfg) {
	const app = cfg.router

	require('./auth/auth.js')(cfg)
	require('./routes/pair.js')(cfg)

	app.use(router)
}
