import React from 'react'

import Router from 'next/router'

import Link from 'next/link'

import { Page, Icon } from '../components/page.js'

import { login, isAuthenticated } from '../components/auth.js'

export default class extends React.Component {
	static getInitialProps (ctx) {
		const isServer = ctx.req && ctx.req.headers

		if (isAuthenticated(ctx.req)) {
			ctx.res.redirect('/')

			return {}
		}

		return {
			isServer,
			message: isServer && ctx.req.flash? ctx.req.flash('message') : void 0
		}
	}

	constructor (props, context) {
		super(props, context)

		this.refPassword = React.createRef()
		this.refEmail = React.createRef()
		this.login = this.login.bind(this)
		this.state = {}

		if (props.authenticated && !props.isServer) {
			Router.push({ pathname: '/', query: {} })
		}
	}

	componentWillUnmount () {
		this.unmounting = true
	}

	login (e) {
		e.preventDefault()
		e.stopPropagation()

		if (!this.unmounting)
			login({
				username: this.refEmail.current.value,
				password: this.refPassword.current.value
			}).then(session => {
				if (session.authenticated) {
					this.props.setSession({
						user: session.user,
						authenticated: !!session.authenticated
					})

					Router.push({ pathname: '/', query: {} })
				} else if (!this.unmounting) this.setState({
					message: session.message
				})
			}, (/*err*/) => { /* throw err */ })
	}

	render () {
		const message = this.props.message || this.state.message

		return <Page title="Login">
			<form action="/login" method="POST" onSubmit={this.login}>
				<div className="container" style={{ padding: '1em', 'maxWidth':  '800px' }}>
					<div className="field">
						<label className="label is-large">Login</label>
						<p className="control has-icons-left has-icons-right">
							<input name="username" ref={this.refEmail} className="input" type="email" placeholder="Email"/>
							<span className="icon is-small is-left">
								<Icon icon={['fas', 'envelope']} size="sm"/>
							</span>
							{/* <span className="icon is-small is-right">
						<i className="fas fa-check"></i>
					</span> */}
						</p>
					</div>
					<div className="field">
						<p className="control has-icons-left">
							<input name="password" ref={this.refPassword} className="input" type="password" placeholder="Password"/>
							<span className="icon is-small is-left">
								<Icon icon={['fas', 'lock']} size="sm"/>
							</span>
						</p>
					</div>

					<div className="field">
						<p className="control">
							<button className="button is-success" style={{width:'100%'}}>
						Login
							</button>
						</p>
					</div>

					<article className="message is-danger">
						<div className="message-body" style={{ display: (message && message.length) || (message && message.length) ? 'initial' : 'none' }}>
							{ (message && message[0]) || message && message[0] }
						</div>
					</article>

					<div>
						<noscript>
							<article className="message is-danger">
								<div className="message-body">
							This site requires <strong>JavaScript</strong>. Please enable it to continue.
								</div>
							</article>
						</noscript>
					</div>

					<article className="message is-info">
						<div className="message-body">
				By proceeding you agree to our <Link prefetch href='/tos'>
								<a><strong>terms of service.</strong></a>
							</Link>
						</div>
					</article>

					<label className="label is-large">Register</label>
					<article className="message">
						<div className="message-body">
							<strong>Need an account?</strong>
							<br/>
			You can register in game by joining our <a href={ this.props.config.GAME_URL }>server</a>.
						</div>
					</article>
				</div>
			</form>
		</Page>
	}
}
