import React from 'react'
import Peer from 'simple-peer'

import Error from 'next/error'
import Router from 'next/router'
import { isAuthenticated } from '../components/auth.js'


export default class Page extends React.Component {
	static async getInitialProps(context) {
		if (context.req && context.req.headers && !isAuthenticated(context.req))
			context.req.res.redirect('/login')

		return {}
	}

	constructor (props, context) {
		super(props, context)
		this.state = {}
		this.pair = this.pair.bind(this)
	}

	// FIXME Got some race condition here
	componentDidMount () {
		setTimeout(()=>  {
			if (!this.props.authenticated) Router.push('/login')
			// else this.pair()
		}, 1000)
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
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ uri: data })
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

		if (this.props.authenticated === void 0) status = 'Loading ...'
		else if (!this.props.authenticated) status = <Error statusCode={403}/>
		else if (this.state.connecting) status = 'Connecting'
		else if (this.state.connected) status = 'Connected'
		else {
			status = 'Disconnected'
			showButton = true
		}

		return <div className='main-content'>
			<style jsx>{`
				.main-content { flex:1; }
			`}</style>
			{ status }
			{ this.state.stats ?
				<div>Health: { this.state.stats.health }</div>: null
			}
			{ showButton?
				<button onClick={this.pair}>PAIR</button> : null
			}
		</div>
	}
}
