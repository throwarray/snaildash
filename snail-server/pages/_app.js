import React from 'react'
import { Container } from 'next/app'
import { withAuth } from '../components/auth.js'
import Head from 'next/head'
import Header from '../components/header.js'
import Footer, { Policy } from '../components/footer.js'
import 'bulma/css/bulma.min.css'
import 'isomorphic-unfetch'
import getConfig from 'next/config'

const {  publicRuntimeConfig: config } = getConfig()

//import { PageTransition } from 'next-page-transitions'
//import '@fortawesome/fontawesome-free/js/all.min.js'

export default withAuth(class extends React.Component {
	constructor (props, context) {
		super(props, context)
		this.state = {
			authenticating: false
		}
	}

	// Initial mount on client when prerendered or when live reloaded
	componentDidMount () {
		if (this.props.authenticated === void 0 && this.props.login)
			this.props.login(void 0, true)
	}

	render () {
		const {
			Component, pageProps, router, login, logout, authenticated, user, message,
			exporting, exported, isServer
		} = this.props

		if (!isServer && !exporting)
			console.log('RENDER PAGE', router.route)

		return <Container>
			<Head>
				<meta key="viewport" name="viewport" content="initial-scale=1.0, width=device-width" />
				<link key="fontawesome" rel="stylesheet" href="https://use.fontawesome.com/releases/v5.3.1/css/all.css" integrity="sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU" crossOrigin="anonymous"/>
				<style key="layout">{`
					.main-content {
						flex: 1;
					}
					#__next {
						display: flex;
						flex-direction: column;
						min-height: 100vh;
					}
					.__next_flex-child {
						min-height: inherit;
					}
					`}
				</style>
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
			<style jsx global>{`
				.page-transition-enter {
					opacity: 0;
				}
				.page-transition-enter-active {
					opacity: 1;
					transition: opacity 300ms;
				}
				.page-transition-exit {
					opacity: 1;
				}
				.page-transition-exit-active {
					opacity: 0;
					transition: opacity 300ms;
				}
				`}</style>

		</Container>
	}
})
