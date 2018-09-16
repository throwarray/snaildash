import Head from 'next/head'

import React from 'react'

const styles = {
	stretch : { flex: '1' },
	marginTop: { marginTop: '1em' }
}


const Page = ({ stars, /* authenticated,*/ user }) => console.log('INDEX RENDER') || <div className="main-content" style={styles.stretch}>
	<Head>
		<title key="title">Welcome to Homepage</title>
	</Head>

	<section className="hero is-bold is-dark">
		<div className="hero-body">
			<div className="container">
				<h1 className="title">
					Welcome { user ? user.username : '' }
				</h1>
				<h2 className="subtitle">
					Lorem ipsum dolor sit amet
				</h2>
			</div>
		</div>
	</section>


	<div className="container" style={styles.marginTop}>
		HOME ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
		Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

		<div className="field is-grouped">
			<p className="control">
				<a className="button is-large" href="https://github.com" target="_blank">
					<span className="icon">
						<i className="fab fa-github" aria-hidden="true"></i>
					</span>
					<span>Github - { stars }</span>
				</a>
			</p>
			<p className="control">
				<a className="button is-large is-primary" href="https://github.com" target="_blank">
					<span className="icon">
						<i className="fas fa-download" aria-hidden="true"></i>
					</span>
					<span>Download</span>
				</a>
			</p>
		</div>

	</div>
</div>

export default Page
