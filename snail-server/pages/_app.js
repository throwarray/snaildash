import React from 'react'
import getConfig from 'next/config'
import App, { Container } from 'next/app'
// import 'isomorphic-unfetch'
import '../components/style.scss'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { faDownload, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons'
import Footer, { Policy } from '../components/footer.js'
import Header from '../components/header.js'
import { login, logout, fetchSession  } from '../components/session.js'
import Loading from '../components/Loading.js'
import Layout from '../components/page.js'
const {  publicRuntimeConfig: config } = getConfig()
// Session
const Session = { session: void 0 }

library.add(faGithub, faEnvelope, faDownload, faLock)

export default class MyApp extends App {
	static async getInitialProps({ Component /*, router */, ctx }) {
		let session
		let pageProps = {}

		// ENV
		const isServer = !!(ctx.req && ctx.req.headers)
		const exporting = !!(ctx.req && !ctx.req.headers)

		// SSR: insert session
		if (isServer)
			session = eval('ctx.req.isAuthenticated()') ? { user: ctx.req.user }: null

		// Get component props (share session state)
		if (Component.getInitialProps)
			pageProps = await Component.getInitialProps({
				...ctx,
				session: session || Session.session
			})

		return {
			session,
			exporting,
			isServer,
			pageProps
		}
	}

	constructor (props, context) {
		super(props, context)

		const noWindow = typeof window === 'undefined'

		Session.session = props.session // insert session

		this.state = {
			exporting: this.props.exporting && noWindow, // env
			isServer: this.props.isServer && noWindow,
			exported: !noWindow && this.props.exporting === true
		}

		this.renderComponent = this.renderComponent.bind(this)
		this.setSession = this.setSession.bind(this)
		this.handleLogout = this.handleLogout.bind(this)
		this.handleLogin = this.handleLogin.bind(this)
	}

	componentWillUnmount () {
		this.unmounted = true
	}

	// Exported: fetch session and rerender
	componentDidMount () {
		if (Session.session === void 0) {
			console.log('FETCH SESSION')

			fetchSession().then(this.setSession, err => { throw err })
		}
	}

	// Client: render app with session state
	setSession ({ session = null }) {
		if (!this.unmounted) {
			Session.session = session

			this.setState({ lastUpdate: Date.now() })
		}

		return session
	}

	// Login: { session } rerender
	handleLogin (creds) {
		if (this.unmounted) throw new Error('App is unmounted')

		if (!this.loggingIn && !Session.session) {
			this.loggingIn = Promise.resolve(this.loggingOut).then(
				()=> login(creds),
				err=> { throw err }
			).then(data => data.session?
				(this.setSession(data), data) : data
			).finally(()=> {
				this.loggingIn = false
			})
		}

		return this.loggingIn
	}

	// Logout: rerender
	handleLogout (evt) {
		if (evt && evt.preventDefault) evt.preventDefault()
		if (this.unmounted) throw new Error('App is unmounted')

		if (!this.loggingOut && Session.session) {
			this.loggingOut = Promise.resolve(this.loggingIn)
				.then(()=> logout()).finally(() => {
					this.setSession({})
					this.loggingOut = false
				})
		}

		return this.loggingOut
	}

	// Render route or loading (fetching state or navigation)
	renderComponent  ({ children }, { loading }) {
		const hasWindow = typeof window !== 'undefined'

		return loading || hasWindow && Session.session === void 0 ?
			<Layout title="Loading">Loading...</Layout>:
			<React.Fragment>
				{ children }
			</React.Fragment>
	}

	render () {
		const { Component, pageProps, router } = this.props

		// Application layout
		return (
			<Container>
				<Header page={ router.route } isAuthenticated={!!Session.session} logout={this.handleLogout}/>
				<Loading render={ this.renderComponent }>
					<Component {...pageProps}
						{ ...this.state }
						session={ !Session.session? Session.session : { ...Session.session } }
						router={ router }
						config={ config }
						page={ router.route }
						setSession={this.setSession}
						login={this.handleLogin}
						logout={this.handleLogout}
					/>
				</Loading>
				<Footer/>
				<Policy/>
			</Container>
		)
	}
}
