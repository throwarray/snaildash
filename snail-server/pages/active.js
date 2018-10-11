import React, { Component } from 'react'

import { Page } from '../components/page.js'

export default class extends Component {
	static async getInitialProps (/*ctx*/) {
		const players = await fetch('http://localhost:3000/active/json').then(res =>
			res.json()
		, err => {
			throw err
		})

		return { players: players || [] }
	}

	render () {
		return <Page title="Active players"> {
			this.props.players.map((player, i) =>
				<div className={'player'} key={player.guid}>
					<style jsx>{`
						* {
							box-sizing: border-box;
						}
						.player {
							display: flex;
							flex-wrap: wrap;
							background: #eee;
							border-radius: 0em 0em 1em 1em;
							box-shadow: 1em 0.5em 1.5em 0.5em #0003;
						}

						.player > * {
							padding: 1em;
							box-sizing: border-box;
						}

						.player--identifiers {
							display: flex;
							flex-wrap: wrap;
						}

						.player--identifier {
							padding: 0 1em;
						}

						.player--kick {
						}
					`}</style>
					<div className={'player--nth'}>{ i }</div>
					<div className={'player--id'}>{ player.id }</div>
					<div className={'player--name'}>{ player.name }</div>
					<div className={'player--ping'}>{ player.ping }</div>
					<div className={'player--endpoint'}>{ player.endpoint }</div>
					<div className={'player--identifiers'}>
						{ player.identifiers.map((identifier)=> {
							return <div key={identifier} className={'player--identifier'}>
								{ identifier }
							</div>
						}) }
					</div>
					<button className={'player--kick'}>🦶</button>
				</div>
			)
		}</Page>
	}
}
