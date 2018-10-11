import React from 'react'

import Link from 'next/link'

import Page, { Icon } from '../components/page.js'

import { withoutAuth } from '../components/session.js'

export default withoutAuth(class extends React.Component {
	// static async getInitialProps (ctx) {
	// 	if (!ctx.req)
	// 		await new Promise(function (resolve) {
	// 			setTimeout(function () { resolve() }, 3000)
	// 		})
	//
	// 	return {}
	// }

	constructor (props, context) {
		super (props, context)

		this.refPassword = React.createRef()
		this.refEmail = React.createRef()

		this.state = {
			asPath: props.router.asPath,
			message: props.message || props.router.query.message
		}

		this.handleSubmit = this.handleSubmit.bind(this)

		if (!props.isServer && !props.exporting)
			props.router.replace(props.router, props.router.route, { shallow: true })
	}

	// Submit the form data
	handleSubmit (evt) {
		evt.preventDefault()

		this.props.login({
			email: this.refEmail.current.value,
			password: this.refPassword.current.value
		}).then(({ session, message }) => {
			if (session) console.log('Logged in successfully')
			else {
				this.setState({
					message: message || 'Invalid email or password'
				})
			}
		}, err => { throw err })
	}

	render () {
		const message = this.state.message

		return <Page title="Login">
			<form action="" method="POST" onSubmit={this.handleSubmit}>
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
						<div className="message-body" style={{ display: message && message.length ? 'initial' : 'none' }}>
							{ message }
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
}, {
	redirect: true,
	fallback: '/'
})
