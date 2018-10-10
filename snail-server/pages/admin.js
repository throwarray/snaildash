import React from 'react'

import Peer from 'simple-peer'

import Error from 'next/error'

import { Page } from '../components/page.js'

import { withAuth, formBody } from '../components/session.js'

export default withAuth(class extends React.Component {
	constructor (props, context) {
		super(props, context)

		this.state = {}
		this.pair = this.pair.bind(this)
	}

	createPeer (addr) {
		if (!addr) return

		const peer = new Peer({ initiator: false, trickle: false })

		peer.on('error', err => {
			console.log('peer-error', err)
			this.destroyPeer()
		})

		peer.on('signal', function (data) {
			console.log('peer-pairing')

			fetch('/pair', {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: formBody({ uri: data })
			})
		})

		peer.on('connect', ()=> {
			console.log('peer-connected')

			setTimeout(function () { peer.send('connect') }, 0)

			this.setState({
				connecting: false,
				connected: true
			})
		})


		peer.on('close', ()=> {
			console.log('peer-closed')

			this.destroyPeer()
		})

		peer.on('data', (data)=> {
			data = JSON.parse(data)

			if (data && data.type == 'stats') {
				this.setState({ stats: data.payload })
			}
		})


		peer.signal(addr)

		this.peer = peer

		this.setState({ connecting: true })

		return peer
	}

	destroyPeer () {
		const peer = this.peer
		if (!peer) return

		console.log('peer-destroy')

		this.peer = null
		peer.removeAllListeners()
		peer.destroy()
		this.setState({ connected: false })
	}

	componentWillUnmount () { this.destroyPeer() }

	// Initiate pairing
	async pair () {
		if (this._pairing || this.peer) return

		try {
			this._pairing = await fetch('/pair')

			const data = await this._pairing.json()

			if (data.uri) {
				console.log('peer-pair-request')
				this.createPeer(data.uri)
			}
		} catch (e) { /**/ }

		this._pairing = null
	}

	render () {
		let status, showButton

		if (this.props.session === void 0) status = <div>
			<noscript>
				<article className="message is-danger">
					<div className="message-body">
						This site requires <strong>JavaScript</strong>. Please enable it to continue.
					</div>
				</article>
			</noscript>
			{!this.props.isServer && !this.props.exporting && <article className="message is-info">
				<div className="message-body">
					Loading...
				</div>
			</article>}
		</div>

		else if (!this.props.session) status = <Error statusCode={403}/>
		else if (this.state.connecting) status = 'Connecting'
		else if (this.state.connected) status = 'Connected'
		else {
			status = 'Disconnected'
			showButton = true
		}

		return <Page title="Admin">
			{ status }
			{ this.state.stats ?
				<div>Health: { this.state.stats.health }</div>: null
			}
			{ showButton?
				<button onClick={this.pair}>PAIR</button> : null
			}
		</Page>
	}
})
