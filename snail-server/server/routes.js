const passport = require('passport')
const bodies = require('body-parser')
const mongoose = require('mongoose')
const { Router } = require('express')
const { parse, format } = require('url')
const router = Router()

const PlayerRemotes = Object.create(null)
const NOOP = ()=> {}

let GetPlayerLicense = NOOP
let RegistrationReply = NOOP

// Redirect middleware
const isRedirect = (req, redirect) => {
	if (!redirect || !redirect.path) return false

	const host = req.hostname
	const xhost = redirect.hostname

	if (xhost !== null && xhost !== host) return false

	return true
}

const redirectRequest = (req, fallback = '/') => {
	const res = req.res
	const query = req.query || {}
	const redirect = parse(query.redirect || fallback, true)

	if (isRedirect(req, redirect)) res.redirect(redirect.path)
	else res.redirect(fallback)
}

function RedirectNonAuthn (req, res, next) {
	if (!req.isAuthenticated()) res.redirect('/login?redirect=%2Fadmin')
	else next()
}

function RedirectAuthn (req, res, next) {
	if (req.isAuthenticated()) redirectRequest(req)
	else next()
}

function Session_RedirectNoScript (req, res) {
	const xhr = (req.body && req.body.xhr) || req.query && req.query.xhr

	if (xhr) res.redirect('/session')
	else redirectRequest(req)
}

function makeid() {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	let text = ''
	for (let i = 0; i < 50; i++)
		text += chars.charAt(Math.floor(Math.random() * chars.length))

	return text
}

router.use(bodies.urlencoded({ extended: true }))
router.use(bodies.json())

// router.use(function(req, res, next) {
// 	res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:3001')
// 	res.header('Access-Control-Allow-Headers', 'X-Requested-With')
// 	next()
// })

if (global.RegisterNetEvent) {
	const refreshPlayer = ()=> {
		const src = global.source
		const license = GetPlayerLicense(src)
		if (license) delete PlayerRemotes[license]

		return license
	}

	GetPlayerLicense = src => {
		let i = 0, ident
		const len = global.GetNumPlayerIdentifiers(src)

		for (; i < len; i++) {
			ident = global.GetPlayerIdentifier(src, i)
			if (ident && ident.startsWith('license')) return ident
		}
	}

	RegistrationReply = (src, err, res)=> {
		setImmediate(function () {
			global.emitNet('snaildash:Register', src, err, res || false)
		})
	}

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

	// CFX-Client signup
	global.RegisterNetEvent('snaildash:Register')
	global.onNet('snaildash:Register', function (email, password)
	{
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

router.get('/user/verify', (req,res) => {
	const token = req.query.token
	const email = req.query.email

	mongoose.model('User').findOneAndUpdate({ email, token }, {
		verified: true,
		token: void 0
	}, (err, result) => {

		if (typeof result === void 0 || err) {
			return res.redirect('/login?message=Invalid%20verification')
		}

		res.redirect('/login?message=Account&verified')

		const client = PlayerRemotes[result.license]

		if (client) setImmediate(function () {
			global.emitNet('snaildash:Verify', client.source, false, true)
		})

		// console.log(`VERIFIED USER: ${ email }`)
	})
})

// Guard admin page
router.get('/admin', RedirectNonAuthn)

// Fetch session state
router.all('/session', function (req, res) {
	if (!req.isAuthenticated()) res.json({ session: null })
	else res.json({ session: { user: req.user } })
})

// Add logout route
router.all('/logout', function (req, res, next) {
	req.logout()
	next()
}, Session_RedirectNoScript)


// Guard login page
router.get('/login', RedirectAuthn)

router.post('/login', function (req, res, next) {
	if (!req.isAuthenticated()) {
		const xhr = req.body.xhr
		const reject = (message = 'Invalid username or password')=> {
			if (xhr) res.json({ session: null, message })
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



////////////////////////////////////////////////////////////////////////////////
// PAIR WRTC CLIENTS

if (global.RegisterNetEvent) { // Set initiator URI
	global.RegisterNetEvent('snaildash:Remote')
	global.onNet('snaildash:Remote', function (remote) {
		const src = global.source
		const license = GetPlayerLicense(src)
		if (license)
			PlayerRemotes[license] =  { source: src, remote }
	})
}

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
		if (global.TriggerClientEvent)
			global.TriggerClientEvent('snaildash:Remote', player.source, req.body.uri)
	}, 500)
})

module.exports = router
