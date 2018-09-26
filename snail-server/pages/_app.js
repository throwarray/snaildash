import React from 'react'
import Head from 'next/head'
import getConfig from 'next/config'
import { Container } from 'next/app'

import 'isomorphic-unfetch'
import '../components/style.scss'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { faDownload, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons'

import { withAuth } from '../components/auth.js'
import Header from '../components/header.js'
import Footer, { Policy } from '../components/footer.js'
//import { PageTransition } from 'next-page-transitions'

const {  publicRuntimeConfig: config } = getConfig()

library.add(faGithub, faEnvelope, faDownload, faLock)

export default withAuth(class extends React.Component {
	// Initial mount on client when prerendered or when live reloaded
	componentDidMount () {
		const dev = config.NODE_ENV === 'development'

		if ((dev || this.props.authenticated === void 0) && this.props.login)
			this.props.login(void 0, true)
	}

	render () {
		const {
			Component, pageProps, router, login, logout, authenticated, user, message,
			exporting, exported, isServer
		} = this.props

		if (!isServer && !exporting) console.log('RENDER PAGE', router.route)

		return <Container>
			<Head>
				<meta name="viewport" content="initial-scale=1.0, width=device-width" />
			</Head>
			<Header user={user} logout={logout} authenticated={authenticated} page={ router.route } />
			{/* <PageTransition timeout={300} classNames="__next_flex-child page-transition"> */}
			<Component
				{ ...pageProps }
				config={config}
				exporting={exporting}
				exported={exported}
				isServer={isServer}
				authenticated={authenticated}
				message={message}
				login={login}
				logout={logout}
				user={user}
			/>

			{/* </PageTransition> */}
			<Footer/>
			<Policy/>

			<noscript>
				<style>{`
					.page-transition-enter {
						opacity: initial;
					}
					`}</style>
			</noscript>
		</Container>
	}
})
