import React from 'react'

import Page, { Icon } from '../components/page.js'

const styles = {
	marginTop: { marginTop: '1em' }
}

export default ({ session }) => {
	const user = session && session.user

	return <Page title="Home">
		<section className="hero is-bold is-dark">
			<div className="hero-body">
				<div className="container">
					<h1 className="title">
					Welcome { user ? user.email : '' }
					</h1>
					<h2 className="subtitle">
					Lorem ipsum dolor sit amet
					</h2>
				</div>
			</div>
		</section>


		<div className="container" style={styles.marginTop}>
		Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

			<div className="field is-grouped">
				<p className="control">
					<a className="button is-large" href="https://github.com/throwarray/snaildash" target="_blank">
						<span className="icon">
							<Icon icon={['fab', 'github']} size="2x"/>
						</span>
						<span>Github</span>
					</a>
				</p>
				<p className="control">
					<a className="button is-large is-primary" href="https://github.com/throwarray/snaildash/archive/master.zip" target="_blank">
						<span className="icon">
							<Icon icon={['fas', 'download']} size="2x"/>
						</span>
						<span>Download</span>
					</a>
				</p>
			</div>

		</div>
	</Page>
}
