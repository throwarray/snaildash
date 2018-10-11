const { RedirectNonAuthn } = require('../auth/redirect.js')
const { GetPlayerInstances } = require('../cfx/utils.js')

module.exports = function ({ router }) {
	// Guard admin page
	router.get('/admin', RedirectNonAuthn)

	// Fetch active players
	router.get('/active/json', (req, res)=> {
		setImmediate(function () {
			const players = GetPlayerInstances()

			res.json(players)
		})
	})
}
