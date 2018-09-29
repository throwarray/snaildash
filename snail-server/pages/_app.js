import React from 'react'
import getConfig from 'next/config'
import { Container } from 'next/app'
import 'isomorphic-unfetch'
import '../components/style.scss'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { faDownload, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons'
import { PageTransition } from 'next-page-transitions'
import { withSession, login } from '../components/auth.js'
import Header from '../components/header.js'
import Footer, { Policy } from '../components/footer.js'
const {  publicRuntimeConfig: config } = getConfig()

const TransitionSub = props => <div className="next-page-transitions">
	{props.children}
</div>

library.add(faGithub, faEnvelope, faDownload, faLock)

export default withSession(class extends React.Component {
	componentDidMount () {
		if ((this.props.authenticated === void 0) && this.props.setSession) {
			console.log('FETCH SESSION')

			login().then(session => {
				if (session.authenticated) this.props.setSession(session)
			}, err => {
				throw err
			})
		}
	}

	render () {
		// const { router, setSession, authenticated, user, exporting, exported, isServer, config } = props

		const { Component, pageProps, ...props } = this.props
		const shouldUpdateKey = props.router.route + '#auth?' + props.authenticated
		const Transition = !props.isServer && !props.exporting && this.renderedOnce?
			PageTransition : TransitionSub

		this.renderedOnce = true

		if (!props.isServer && !props.exporting)
			console.log('RENDER PAGE', props.router.route, this.props)

		return <Container>
			<Header { ...props } logout= { this.logout } page={ props.router.route } config={ config } />
			<Transition timeout={500} classNames="next-page-transitions page-transition">
				<Component
					{ ...props }
					page={ props.router.route }
					config={ config }
					key={ shouldUpdateKey }
					{ ...pageProps }
				/>
			</Transition>
			<Footer/>
			<Policy/>
		</Container>
	}
})
