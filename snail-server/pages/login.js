import React from 'react'

import Router from 'next/router'

import Link from 'next/link'

import { Page, Icon } from '../components/page.js'

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
