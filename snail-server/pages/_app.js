import React from 'react'
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
const NOOP = ()=> {}

library.add(faGithub, faEnvelope, faDownload, faLock)

export default withAuth(class extends React.Component {
	// Initial mount on client when prerendered or when live reloaded
	componentDidMount () {
		const dev = config.NODE_ENV === 'development'

		if ((dev || this.props.authenticated === void 0) && this.props.login)
			this.props.login(void 0, true).then(NOOP, NOOP)
	}

	render () {
		const { Component, pageProps, ...props } = this.props

		if (!props.isServer && !props.exporting)
			console.log('RENDER PAGE', props.router.route)

		return <Container>
			<Header
				{ ...props }
				page={ props.router.route }
				config={ config } />
			{/* <PageTransition timeout={300} classNames="__next_flex-child page-transition"> */}
			<Component
				{ ...props }
				page={ props.router.route }
				config={ config }
				{ ...pageProps }
			/>
			{/* </PageTransition> */}

			<Footer/>
			<Policy/>
		</Container>
	}
})
