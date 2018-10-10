const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const flash = require('connect-flash')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const cookieParser = require('cookie-parser')()
const { Strategy } = require('passport-local')

const transporter = process.env.SMTP_SERVER_ADDRESS? nodemailer.createTransport({
	host: process.env.SMTP_SERVER_ADDRESS,
	port: process.env.SMTP_SERVER_PORT,
	secure: true,
	auth: {
		user: process.env.EMAIL_ADDRESS,
		pass: process.env.EMAIL_PASSWORD
	},
	dkim: {
		domainName: process.env.DOMAIN_ADDRESS,
		keySelector: process.env.DKIM_SELECTOR,
		privateKey: process.env.DKIM_KEY.replace(/\\n/g, '\n')
	}
}) : nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL_ADDRESS,
		pass: process.env.EMAIL_PASSWORD
	}
})

const Schema = mongoose.Schema

const UserSchema = Schema({
	email: {
		type: String,
		trim: true,
		lowercase: true,
		unique: true,
		required: 'Email address is required',
		match: [
			/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
			'Please fill a valid email address'
		]
	},
	password: { type: String, required: true, minlength: 6, maxlength: 18 },
	license: { type: String, required: true, unique: true },
	token: { type: String, required: true },
	verified: { type: Boolean, required: true, default: false },
	isAdmin: { type: Boolean }
})

function UTF8Length (s) { return ~-encodeURI(s).split(/%..|./).length }

UserSchema.pre('save', function (next) {
	const user = this
	const saltRounds = 10

	if (!this.isModified('password')) return next()

	if (UTF8Length(user.password) > 18) return next(true)

	bcrypt.hash(user.password, saltRounds, function (err, hash) {
		if (err) return next(err)
		user.password = hash

		next()
	})
})

UserSchema.post('save', function (user, next) {
	const href = process.env.APPLICATION_URL +
		'/user/verify/?token=' + user.token + '&email=' + user.email

	const mailOptions = {
		from: process.env.EMAIL_ADDRESS,
		to: user.email,
		subject: 'SnailDash: Account Verification',
		html: `
		<center><h1>SNAILDASH</h1></center>
		<br>
			<center>
				<p>
					Hi! It seems like you have registered a new account on snaildash,
					Please click <a href="${ href }">here</a> to verify your account and
					start using it!
				</p>
			</center>`
	}

	transporter.sendMail(mailOptions, function (err /*, info */) {
		if (err) return next(err)
		next()
	})
})

const comparePassword = function (user, password, cb) {
	bcrypt.compare(password, user.password, function (err, res) {
		err = err || !res

		cb(err, !err)
	})
}

mongoose.model('User', UserSchema)

// mongoose.model('User').ensureIndexes()

function LocalStrategy (req, email, password, cb) {
	mongoose.model('User').findOne({ email }, function(err, user) {
		if (err) return cb(err)
		if (!user) return cb(null, false)
		if (!user.verified) return cb(new Error('Please verify your email.'))

		comparePassword(user, password, function (err, res) {
			if (err || !res) cb(null, false)
			else cb(null, user)
		})
	})
}

////////////////////////////////////////////////////////////////////////////////

passport.use(new Strategy({
	usernameField: 'email',
	passReqToCallback: true
}, LocalStrategy))

passport.serializeUser((user, cb)=> cb(null, user.id))

passport.deserializeUser(function (id, cb) {
	mongoose.model('User').findById(id, function (err, user) {
		if (err) cb(err)
		else cb(null, user)
	})
})

module.exports = function ({ router }) {
	const sessionSettings = {
		key: 'session',
		cookieName: 'session',
		store: new MongoStore({ mongooseConnection: mongoose.connection }),
		secret: process.env.SESSION_SECRET || 'octocat',
		resave: false,
		saveUninitialized: false
	}

	router.use(cookieParser)
	router.use(session(sessionSettings))
	router.use(flash())
	router.use(passport.initialize())
	router.use(passport.session())
}
