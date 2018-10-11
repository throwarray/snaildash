import React from 'react'
import { withRouter } from 'next/router'

export default withRouter(class extends React.Component {
	constructor (props, context) {
		super(props, context)

		this.state = {}
		this.onRouteChangeStart = this.onRouteChangeStart.bind(this)
		this.onRouteChangeComplete = this.onRouteChangeComplete.bind(this)
		this.onRouteChangeError = this.onRouteChangeError.bind(this)

		if (typeof window !== 'undefined') {
			this.props.router.events.on('routeChangeStart', this.onRouteChangeStart)
			this.props.router.events.on('routeChangeComplete', this.onRouteChangeComplete)
			this.props.router.events.on('routeChangeError', this.onRouteChangeError)
		}
	}

	onRouteChangeStart (url) {
		if (url !== this.props.router.pathname)
			this.setState({ loading: url })
	}

	onRouteChangeComplete (/*url*/) { this.setState({ loading: null }) }

	onRouteChangeError (/*err, url*/) { this.setState({ loading: null }) }

	componentWillUnmount () {
		this.props.router.events.off('routeChangeStart', this.onRouteChangeStart)
		this.props.router.events.off('routeChangeComplete', this.onRouteChangeComplete)
		this.props.router.events.off('routeChangeError', this.onRouteChangeError)
	}

	render () {
		return this.props.render(this.props, this.state)
	}
})
