const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer');
const Schema = mongoose.Schema
const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL_ADDRESS,
		pass: process.env.EMAIL_PASSWORD
	}
});
const NotVerifiedUserSchema = Schema({
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true, minlength: 6, maxlength: 18 },
	license: { type: String, required: true, unique: true },
	token: { type: String, required: true, unique: true }
})

const VerifiedUserSchema = Schema({
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true, minlength: 6, maxlength: 18 },
	license: { type: String, required: true, unique: true }
})


function UTF8Length (s) { return ~-encodeURI(s).split(/%..|./).length }

NotVerifiedUserSchema.pre('save', function (next) {
	const user = this
	const saltRounds = 10
	
	if (!this.isModified('password')) return next()
	
	if (UTF8Length(user.password) > 18) return next(true)

	var mailOptions = {
		from: process.env.EMAIL_ADDRESS, // sender address
		to: user.email, // list of receivers
		subject: 'SnailDash: Account Verification', // Subject line
		html: `<center><h1>SNAILDASH</h1></center><br><center><p>Hi! It seems like you have registered a new account on snaildash, please click <a href="${process.env.APPLICATION_URL + '/user/verify/?token=' + user.token+'&email=' + user.email}">HERE</a> to verify your account and start using it!</p></center>`// plain text body
	};
	
	transporter.sendMail(mailOptions, function (err, info) {
		if(err)
		console.log(err)
		else
		console.log(info);
	});
	
	bcrypt.hash(user.password, saltRounds, function (err, hash) {
		if (err) return next(err)
		
		user.password = hash
		next()
	})
})



const comparePassword = function (user, password, cb) {
	bcrypt.compare(password, user.password, function (err, res) {
		err = err || !res
		
		cb(err, !err)
	})
}

mongoose.model('User', NotVerifiedUserSchema)
mongoose.model('VerifiedUser', VerifiedUserSchema)


// mongoose.model('User').ensureIndexes()

////////////////////////////////////////////////////////////////////////////////
const flash = require('connect-flash')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const cookieParser = require('cookie-parser')()
const { Strategy } = require('passport-local')

function LocalStrategy (email, password, cb)
{
	mongoose.model('VerifiedUser').findOne({ email }, function(err, user) {
		if (err) return cb(err)
		if (!user) return cb(null, false)
		
		comparePassword(user, password, function (err, res) {
			if (err || !res) cb(null, false)
			else cb(null, user)
		})
	})
}

const localStrategy = new Strategy(LocalStrategy)

function SerializeUser (user, cb) { cb(null, user.id) }

function DeserializeUser (id, cb) {
	mongoose.model('User').findById(id, function (err, user) {
		if (err) cb(err)
		else cb(null, user)
	})
}

passport.use(localStrategy)
passport.serializeUser(SerializeUser)
passport.deserializeUser(DeserializeUser)

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
