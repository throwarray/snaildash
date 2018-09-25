const passport = require('passport')
const bodies = require('body-parser')
const mongoose = require('mongoose')
const router = require('express').Router()
const PlayerRemotes = Object.create(null)
const NOOP = ()=> {}

let GetPlayerLicense = NOOP
let RegistrationReply = NOOP


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
			const user = new User ({ license, email, password, token })

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
			req.flash('message', 'Invalid verification.')

			return res.redirect('/login')
		}

		res.redirect('/login')

		const client = PlayerRemotes[result.license]

		if (client) setImmediate(function () {
			global.emitNet('snaildash:Verify', client.source, false, true)
		})

		// console.log(`VERIFIED USER: ${ email }`)
	})
})

router.all('/logout', (req, res) => {
	const xhr = !!(req.body && req.body.xhr)

	req.logout()

	if (!xhr) res.redirect('/')
	else res.json({ authenticated: false })
})

// TODO Clean this up
router.post('/login', function (req, res, next) {
	const xhr = !!(req.body && req.body.xhr)

	// request is authenticated already
	if (xhr && req.isAuthenticated()) {
		res.json({ user: req.user.toJSON(), authenticated: true })
		return
	}

	passport.authenticate('local', function(err, user /*, info */) {
		const message = 'Invalid potatoes or password.'

		if (err) {
			if (xhr) return res.json({
				message: err.message,
				authenticated: false
			})
			else return next(err)
		}

		if (!user) {
			if (!xhr) {
				req.flash('message', message)

				return res.redirect('/login')
			}

			return res.json({
				message,
				authenticated: false
			})
		}

		req.logIn(user, function(err) {
			req.flash('message') // clear

			if (err) {
				if (xhr) return res.json({
					message: err.message,
					authenticated: false
				})
				else return next(err)
			}

			if (xhr) return res.json({
				user: req.user.toJSON(),
				authenticated: true
			})

			return res.redirect('/')
		})
	})(req, res, next)
})

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
