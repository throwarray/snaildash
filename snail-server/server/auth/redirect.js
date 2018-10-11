const { parse } = require('url')

function isRedirect (req, redirect) {
	if (!redirect || !redirect.path) return false

	const host = req.hostname
	const xhost = redirect.hostname

	if (xhost !== null && xhost !== host) return false

	return true
}

function redirectRequest (req, fallback = '/') {
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

function Session_RedirectNoScript (req, res) {
	if (req.headers.accept === 'application/json') res.redirect('/session')
	else redirectRequest(req)
}

function RedirectAuthn (req, res, next) {
	if (req.isAuthenticated())
		redirectRequest(req)
	else next()
}

module.exports = {
	RedirectAuthn,
	RedirectNonAuthn,
	redirectRequest,
	Session_RedirectNoScript,
}
