import React from 'react'
import getConfig from 'next/config'
import { Container } from 'next/app'

import 'isomorphic-unfetch'
import '../components/style.scss'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { faDownload, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons'
import { PageTransition } from 'next-page-transitions'

import { withAuth } from '../components/auth.js'
import Header from '../components/header.js'
import Footer, { Policy } from '../components/footer.js'

const {  publicRuntimeConfig: config } = getConfig()
const NOOP = ()=> {}
const TransitionSub = (props) => <div className="next-page-transitions">
	{props.children}
</div>

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
		const Transition = !this.props.isServer && !this.props.exporting &&
			this.rendered ? PageTransition : TransitionSub

		this.rendered = true

		if (!props.isServer && !props.exporting)
			console.log('RENDER PAGE', props.router.route)

		return <Container>
			<Header
				{ ...props }
				page={ props.router.route }
				config={ config } />
			<Transition timeout={500} classNames="next-page-transitions page-transition">
				<Component
					{ ...props }
					page={ props.router.route }
					config={ config }
					{ ...pageProps }
					key={ this.props.router.route }
				/>
			</Transition>
			<Footer/>
			<Policy/>
		</Container>
	}
})
