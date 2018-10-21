import React, { Component } from 'react'

import { Page } from '../components/page.js'

export default class extends Component {
	onError (err) {
		console.log('onError', err)

		this.update({ status: 'error' })
	}

	onOpen () {
		console.log('onOpen')
		this.update({ status: 'connected' })
	}

	onClose () {
		console.log('onClose')

		this.update({ status: 'disconnected' })
	}

	onMessage (message) {
		let action

		if (!this.unmounted && typeof message.data == 'string') {
			try {
				action = JSON.parse(message.data)
			} catch (e) {
				throw e
			}

			if (action && action.type && this.actions[action.type])
				this.actions[action.type](action)
		}
	}

	update (state) {
		if (!this.unmounted) this.setState(state)
	}

	constructor (props, context) {
		super(props, context)
		this.onError = this.onError.bind(this)
		this.onOpen = this.onOpen.bind(this)
		this.onClose = this.onClose.bind(this)
		this.onMessage = this.onMessage.bind(this)
		this.dropPlayer = this.dropPlayer.bind(this)

		this.state = {
			status: 'disconnected',
			players: []
		}

		// Action handlers
		this.actions = Object.assign(Object.create(null), {
			// initialState
			init: ({ payload }) => {
				this.setState({ players: payload.players })

				// console.log('Active players', payload.players)
			},
			playerDropped: ({ payload }) => {
				// console.log('Player dropped', payload)

				this.setState({
					players: this.state.players.filter(function (player) {
						return player.guid !== payload.guid
					})
				})
			},
			playerConnecting: ({ payload }) => {
				let updated = false

				const players = this.state.players.map(function (player) {
					if (player.guid == payload.guid)  {
						updated = true
						return payload
					} else return player
				})

				if (!updated) {
					players.push(payload)
					// console.log('Player activated', payload.name)
				}

				this.setState({
					players
				})
			}
		})
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

	dropPlayer (evt) {
		if (evt.target && evt.target.hasAttribute('data-id'))
			this.ws.send(JSON.stringify({
				type: 'dropPlayer',
				payload: Number(evt.target.getAttribute('data-id'))
			}))
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
			<div className="cstatus">
				<style jsx>{`
					.cstatus {
						background: #222;
						color: #fff;
					}
				`}</style>
				Connection status: { this.state.status }
			</div>

			{
				this.state.players && this.state.players.map((player, i) =>
					<div className={'player'} key={player.guid}>
						<style jsx>{`
						* {
							box-sizing: border-box;
						}
						.player {
							display: flex;
							flex-wrap: wrap;
							background: #eee;
							border-radius: 0em 0em 0.5em 0.5em;
							box-shadow: 1em 0.5em 1.5em 0.5em #0003;
						}

						.player > * {
							padding: 1em;
							box-sizing: border-box;
						}

						.identifiers {
							display: flex;
							flex-wrap: wrap;
						}

						.identifier {
							padding: 0 1em;
						}

						.kick {
						}
					`}</style>
						<div className={'nth'}>{ i }</div>
						<div className={'id'}>{ player.id }</div>
						<div className={'name'}>{ player.name }</div>
						<div className={'ping'}>{ player.ping }</div>
						<div className={'endpoint'}>{ player.endpoint }</div>
						<div className={'identifiers'}>
							{ player.identifiers.map((identifier)=> {
								return <div key={identifier} className={'identifier'}>
									{ identifier }
								</div>
							}) }
						</div>
						<button data-id={player.id} className={'kick'} onClick={ this.dropPlayer }>
							🦶
						</button>
					</div>
				)
			}
		</Page>
	}
}
