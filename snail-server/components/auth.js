import App from 'next/app'
import React from 'react'

export function isAuthenticated (req) {
	return !!(req && req.isAuthenticated && req.isAuthenticated())
}

const isArray = a => Array.isArray(a)

const REQUEST_HEADERS = {
	'Accept': 'application/json', 'Content-Type': 'application/json'
}

function AuthResponse () {
	return {
		authenticated: false,
		message: void 0,
		user: null,
		date: Date.now()
	}
}

export async function login (creds) {
	let response = void 0
	let data = {}

	try {
		response = await fetch('/login', {
			headers: REQUEST_HEADERS,
			body: JSON.stringify({ ...creds, xhr: true }),
			method: 'POST'
		})
		data = await response.json()
	} catch (e) { /* Invalid JSON */ }

	if (data.message && !isArray(data.message)) data.message = [data.message]

	return Object.assign(AuthResponse(), {
		message: creds === void 0 ? void 0: data.message,
		authenticated: !!data.authenticated,
		user: data.user
	})
}

export async function logout () {
	let response = void 0
	let data = {}

	try {
		response = await fetch('/logout', {
			headers: REQUEST_HEADERS,
			body: JSON.stringify({ xhr: true }),
			method: 'POST'
		})

		data = await response.json()
	} catch (e) { /* Invalid JSON */ }

	if (data.message && !isArray(data.message)) data.message = [data.message]

	return Object.assign(AuthResponse(), { message: data.message })
}

// TODO Don't extend app here
export function withSession (Component) {
	return class extends App {
		static async getInitialProps ({ Component: Comp, ctx }) {
			const isServer = !!ctx.req
			const exporting = isServer && !ctx.req.headers
			const pageProps = Comp.getInitialProps?
				await Comp.getInitialProps(ctx) : {}

			const props = isServer && !exporting? {
				user: ctx.req.user,
				authenticated: isAuthenticated(ctx.req),
				pageProps,
				exporting, isServer
			} : {
				pageProps,
				exporting, isServer: false
			}

			return props
		}

		constructor (props, context) {
			super(props, context)

			this.state = {}
			this.setSession = this.setSession.bind(this)
			this.onStorage = this.onStorage.bind(this)
		}

		SessionState (session) {
			return {
				user: void 0,
				authenticated: false,
				...session
			}
		}

		setSession (session) {
			session = this.SessionState(session)
			localStorage.setItem('session', JSON.stringify(session))
			this.setState(session)
		}

		onStorage (evt) {
			if (evt.key === 'session') {
				const session = this.SessionState(JSON.parse(evt.newValue))

				if (session.authenticated != this.state.authenticated) {
					console.log(
						session.authenticated? 'LOGGED IN':'LOGGED OUT', 'FROM ANOTHER TAB'
					)

					this.setState(session)
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
			const noWindow = typeof window === 'undefined'
			const envProps = {
				exporting: this.props.exporting && noWindow,
				isServer: this.props.isServer && noWindow,
				exported: !noWindow && this.props.exporting === true
			}

			return <Component { ...this.state } { ...this.props }
				{ ...envProps }
				setSession={ this.setSession }/>
		}
	}
}
