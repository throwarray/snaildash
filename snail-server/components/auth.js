import App from 'next/app'
import React from 'react'

export function isAuthenticated (req)
{
	return !!(req && req.isAuthenticated && req.isAuthenticated())
}

const isArray = a => Array.isArray(a)

async function login (creds, withoutMessage) {
	let response = void 0
	let data = {}

	try {
		response = await fetch('/login', {
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				...creds,
				xhr: true
			}),
			method: 'POST'
		})
		data = await response.json()
	} catch (e) { /* Invalid JSON */ }

	if (data.message && !isArray(data.message))
		data.message = [data.message]

	return {
		message: !withoutMessage? data.message : void 0,
		authenticated: !!data.authenticated,
		user: data.user
	}
}

async function logout () {
	let response = void 0
	let data = {}

	try {
		response = await fetch('/logout', {
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				xhr: true
			}),
			method: 'POST'
		})

		data = await response.json()
	} catch (e) { /* Invalid JSON */ }

	if (data.message && !isArray(data.message)) data.message = [data.message]

	return {
		message: data.message,
		authenticated: false,
		user: void 0
	}
}

// TODO Don't extend app here
export function withAuth (Component) {
	return class extends App {
		static async getInitialProps ({ Component: Comp, /* router, */ ctx }) {
			const isServer = !!ctx.req
			const exporting = !!(isServer && !ctx.req.headers)
			const pageProps = Comp.getInitialProps?
				await Comp.getInitialProps(ctx) : {}

			return isServer && !exporting? {
				message: isServer && ctx.req.flash? ctx.req.flash('message') : void 0,
				user: ctx.req.user,
				authenticated: isAuthenticated(ctx.req),
				pageProps,
				exporting,
				isServer
			} : {
				pageProps,
				exporting,
				isServer: false
			}
		}

		constructor (props, context) {
			super(props, context)

			const exported = props.exporting === void 0

			this.state = {
				message: props.message,
				user: props.user,
				authenticated: props.authenticated,
				exporting: !!(props.exporting),
				exported
			}

			this.logout = this.logout.bind(this)
			this.login = this.login.bind(this)
		}

		async logout () {
			const state = await logout()

			this.setState(state || {})

			console.log('LOGGED OUT')

			return true
		}

		async login (creds, withoutMessage) {
			if (creds === void 0 && withoutMessage)
				console.log('REFRESH LOGIN STATUS')

			const auth = await login(creds, withoutMessage)

			this.setState(auth || {})

			if (auth.authenticated) console.log('LOGGED IN')

			return !!(auth.authenticated)
		}

		render () {
			return <Component { ...this.props } { ...this.state }
				login={ this.login } logout={ this.logout }/>
		}
	}
}
