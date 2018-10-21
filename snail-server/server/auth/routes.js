const { format, parse } = require('url')
const passport = require('passport')
const mongoose = require('mongoose')
const { PlayerRemotes, GetPlayerLicense } = require('../cfx/utils.js')
const { RedirectAuthn, redirectRequest } = require('./redirect.js')

function makeid () {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	let text = ''
	for (let i = 0; i < 50; i++)
		text += chars.charAt(Math.floor(Math.random() * chars.length))

	return text
}

function RegistrationReply (src, err, res) {
	setImmediate(function () {
		global.emitNet('snaildash:Register', src, err, res || false)
	})
}

if (global.RegisterNetEvent) {
	// CFX-Client signup
	global.RegisterNetEvent('snaildash:Register')
	global.onNet('snaildash:Register', function (email, password) {
		const src = global.source
		const license = GetPlayerLicense(src)

		if (license) {
			const token = makeid()
			const User = mongoose.model('User')
			const user = new User ({
				license, email, password, token,
				isAdmin: false // FIXME
			})

			user.save(function (err /*, user*/) {
				if (err) {
					if (err.errors)
						RegistrationReply(src, 1) // Error: Failed to validate user
					else if (err.message.startsWith('E11000 duplicate')) {
						// Error: Duplicate License || Email already in use
						mongoose.model('User').findOne({ license }, function (err, user) {
							RegistrationReply(src, user ? 4 : 2, user && user.verified)
						})
					}
					else
						RegistrationReply(src, 3) // Error: Failed to save user
				} else
					RegistrationReply(src, false, false) // Success: User registered
			})
		} else RegistrationReply(src, 3)
	})
}

module.exports = function (cfg) {
	const { router } = cfg

	function SendSession (req, res) {
		if (!req.isAuthenticated())
			res.json({ session: null })
		else
			res.json({ session: { user: req.user } })
	}

	function Session_RedirectNoScript (req, res) {
		if (req.headers.accept === 'application/json')
			SendSession(req, res)
		else redirectRequest(req)
	}

	// Fetch session state
	router.all('/session', SendSession)

	// Add logout route
	router.all('/logout', function (req, res, next) {
		if (cfg.handleLogout) cfg.handleLogout(req)
		req.logout()
		next()
	}, Session_RedirectNoScript)

	// Guard login page
	router.get('/login', RedirectAuthn)

	router.post('/login', function (req, res, next) {
		if (!req.isAuthenticated()) {
			const reject = (message = 'Invalid username or password')=> {
				if (req.headers.accept === 'application/json')
					res.json({ session: null, message })
				else {
					const dest = /* req._parsedUrl || */ parse(req.url, true)

					dest.query.message = message
					dest.search = null

					res.redirect(format(dest))
				}
			}

			passport.authenticate('local', function(err, user /*, info */) {
				if (err || !user) reject()
				else req.logIn(user, function (err) {
					if (!err) next()
					else reject()
				})
			})(req, res, next)
		}
		else next()
	}, Session_RedirectNoScript)

	// Verify email
	router.get('/auth/verify', (req,res) => {
		const token = req.query.token
		const email = req.query.email

		mongoose.model('User').findOneAndUpdate({ email, token }, {
			verified: true,
			token: void 0
		}, (err, result) => {

			if (result === void 0 || result === null || err) {
				return res.redirect('/login?message=Invalid%20verification')
			}

			res.redirect('/login?verified&message=Account%20verified')

			const client = PlayerRemotes[result.license]

			if (client) setImmediate(function () {
				global.emitNet('snaildash:Verify', client.source, false, true)
			})
		})
	})
}
