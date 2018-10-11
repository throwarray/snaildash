////////////////////////////////////////////////////////////////////////////////
// PAIR WRTC CLIENTS
const { GetPlayerLicense, PlayerRemotes } = require('../cfx/utils.js')

if (global.RegisterNetEvent) { // Set initiator URI
	global.RegisterNetEvent('snaildash:Remote')
	global.onNet('snaildash:Remote', function (remote) {
		const src = global.source
		const license = GetPlayerLicense(src)
		if (license)
			PlayerRemotes[license] =  { source: src, remote }
	})
}

module.exports = function ({ router }) {
	router.get('/pair', function (req, res) { // Get initiator URI
		if (!req.isAuthenticated())
			return res.json({ message: 'unauthorized' })

		const player = PlayerRemotes[req.user.license]

		if (!player || !global.GetNumPlayerIdentifiers(player.source))
			return res.json({ message: 'offline' }) // fivem client is offline

		res.json({ uri: player.remote })
	})

	router.post('/pair', function (req, res) {
		if (!req.isAuthenticated())
			return res.json({ message: 'unauthorized' })

		const player = PlayerRemotes[req.user.license]

		if (!player || !global.GetNumPlayerIdentifiers(player.source))
			return res.json({ message: 'offline' })

		res.json({ uri: player.remote })

		delete PlayerRemotes[req.user.license]

		setTimeout(function () {
			if (global.TriggerClientEvent) global.TriggerClientEvent(
				'snaildash:Remote', player.source, req.body.uri
			)
		}, 500)
	})
}
