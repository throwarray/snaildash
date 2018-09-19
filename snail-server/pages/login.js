import React from 'react'

import Head from 'next/head'

import Router from 'next/router'

export default class extends React.Component {
	constructor (props, context) {
		super(props, context)

		this.refPassword = React.createRef()
		this.refEmail = React.createRef()
		this.login = this.login.bind(this)
	}

	login (e) {
		e.preventDefault()
		e.stopPropagation()
		this.props.login({
			username: this.refEmail.current.value,
			password: this.refPassword.current.value
		}).then(function (loggedIn) {
			if (loggedIn) {
				Router.push({ pathname: '/', query: {} })
			}
		}, function () {})
	}

	render () {
		let { message, exporting, exported } = this.props

		// console.log('RENDER LOGIN', message)

		return <form action="/login" method="POST" onSubmit={this.login} className="main-content" style={{ flex: 1 }}>
			<Head>
				<title key="title">Welcome to Login</title>
			</Head>
			<div className="container" style={{ padding: '1em', 'maxWidth':  '800px' }}>
				<div className="field">
					<label className="label is-large">Login</label>
					<p className="control has-icons-left has-icons-right">
						<input name="username" ref={this.refEmail} className="input" type="email" placeholder="Email"/>
						<span className="icon is-small is-left">
							<i className="fas fa-envelope"></i>
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
							<i className="fas fa-lock"></i>
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
					<div className="message-body" style={{ display: (this.props.message && this.props.message.length) || (message && message.length) ? 'initial' : 'none' }}>
						{ (this.props.message && this.props.message[0]) || message && message[0] }
					</div>
				</article>

				<div>
					{ exporting || exported ? <noscript>
						<article className="message is-danger">
							<div className="message-body">
								This site requires <strong>JavaScript</strong>. Please enable it to continue.
							</div>
						</article>
					</noscript> : <div></div>
					}
				</div>

				<article className="message is-info">
					<div className="message-body">
						By proceeding you agree to our <a><strong>terms of service.</strong></a>.
					</div>
				</article>

				<label className="label is-large">Register</label>
				<article className="message">
					<div className="message-body">
						Lorem <strong>Pellentesque risus mi</strong>, . Nullam gravida <a>felis venenatis</a> efficitur. Aenean ac <em>stuff</em>.
					</div>
				</article>
			</div>
		</form>
	}
}
