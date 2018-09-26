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
			this.onStorage = this.onStorage.bind(this)
		}

		defaultState () {
			return {
				authenticated: false,
				message: void 0,
				user: void 0,
				date: Date.now()
			}
		}

		async logout () {
			const auth = await logout()
			const state = Object.assign(this.defaultState(), auth)

			localStorage.setItem('auth', JSON.stringify(state))

			this.setState(state)

			return true
		}

		async login (creds, withoutMessage) {
			if (creds === void 0 && withoutMessage) console.log('FETCH LOGIN STATUS')

			const auth = await login(creds, withoutMessage)
			const state = Object.assign(this.defaultState(), auth)

			localStorage.setItem('auth', JSON.stringify(state))

			this.setState(state)

			if (auth.authenticated) console.log('LOGGED IN')

			return !!(auth.authenticated)
		}

		onStorage (evt) {
			if (evt.key === 'auth') {
				const auth = JSON.parse(evt.newValue)
				const state = Object.assign(this.defaultState(), auth)

				if (state.authenticated != this.state.authenticated) // NOTE ==
				{
					console.log(
						state.authenticated? 'LOGGED IN' : 'LOGGED OUT', 'FROM ANOTHER TAB'
					)

					this.setState(state)
				}
			}
		}

		componentDidMount () {
			window.addEventListener('storage', this.onStorage)
		}

		componentWillUnmount () {
			window.removeEventListener('storage', this.onStorage)
		}

		render () {
			return <Component { ...this.props } { ...this.state }
				login={ this.login } logout={ this.logout }/>
		}
	}
}
