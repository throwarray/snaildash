import React from 'react'

import Link from '../components/link.js'

// import Head from 'next/head'

export class Policy extends React.Component {
	constructor (props, context) {
		super(props, context)

		this.hidePolicy = this.hidePolicy.bind(this)

		this.state = { visible: true }
	}

	hidePolicy () { this.setState({ visible: false }) }

	render () {
		return !this.state.visible? null : <footer>
			<div className="footer-body">
				<div style={{ flex: '1' }}>
					This website uses <a href="https://en.wikipedia.org/wiki/HTTP_cookie"><strong>cookies</strong></a> and by using this service you agree to the following <Link href="/tos">
						<a><strong>terms</strong></a>
					</Link>.
				</div>
				<button className="delete" aria-label="delete" onClick={ this.hidePolicy }></button>
			</div>
			<style jsx>{`
			footer {
				position: sticky;
				bottom: 0;
			}

			.footer-body {
				display: flex;
				background:black;
				color: #fff;
				padding: 1em;
			}
			`}</style>
		</footer>
	}
}

const Footer = ()=> <footer className="footer">
	<div className="content has-text-centered">
		<p>
			<strong>SNAIL DASH</strong> by <a href="https://jgthms.com">throwarray</a>. The source code is licensed <a href="http://opensource.org/licenses/mit-license.php">MIT</a>.
		</p>
	</div>
</footer>


export default Footer
