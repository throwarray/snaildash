const mongoose = require('mongoose')
const { GetPlayerLicense, PlayerRemotes } = require('./cfx/utils.js')

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
	require('./auth/auth.js')(cfg)
	require('./routes/user.js')(cfg)
	require('./routes/pair.js')(cfg)
}
