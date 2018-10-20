import React, { Component } from 'react'

import { Page } from '../components/page.js'

export default class extends Component {
	onError (/*err*/) {
		console.log('onError')
		this.update({ status: 'error' })
	}

	onOpen () {
		console.log('onOpen')
		this.update({ status: 'connected' })
	}

	onClose () {
		console.log('onClose')

		if (!this.unmounted)
			this.update({ status: 'disconnected' })
	}

	onMessage (message) {
		if (typeof message.data == 'string')
			console.log('onMessage', message.data)
	}

	update (state) {
		this.setState(state)
	}

	constructor (props, context) {
		super(props, context)
		this.onError = this.onError.bind(this)
		this.onClose = this.onClose.bind(this)
		this.onMessage = this.onMessage.bind(this)
		this.onOpen = this.onOpen.bind(this)
		this.state = { status: 'disconnected' }
	}

	componentDidMount () {
		const hostname = location.hostname
		const port = location.port
		const ws = new WebSocket(`ws://${hostname}:${port}`)

		ws.addEventListener('error', this.onError)

		ws.addEventListener('open', this.onOpen)

		ws.addEventListener('close', this.onClose)

		ws.addEventListener('message', this.onMessage)

		this.ws = ws
		this.update({ status: 'connecting' })
	}

	componentWillUnmount () {
		const ws = this.ws

		ws.removeEventListener('error', this.onError)
		ws.removeEventListener('open', this.onOpen)
		ws.removeEventListener('close', this.onClose)
		ws.removeEventListener('message', this.onMessage)
		ws.close()
	}

	render () {
		return <Page>
			<div>
				status { this.state.status }
			</div>
		</Page>
	}
}
