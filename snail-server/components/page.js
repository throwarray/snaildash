import Head from 'next/head'

import React from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const defaultStyles = { flex: '1' }

const Page = (props)=> {
	// const {
	// 	router, login, logout, authenticated, user, message,
	// 	exporting, exported, isServer, config
	// } = props

	return <React.Fragment>
		<Head>
			{ props.title && <title key="title">{props.title}</title> }
			<meta key="viewport" name="viewport" content="initial-scale=1.0, width=device-width" />
			{/* <noscript>
			<style>{`
				.page-transition-enter {
					opacity: initial;
				}
				`}</style>
		</noscript> */}
		</Head>
		<div style={props.style || defaultStyles}>{ props.children }</div>
	</React.Fragment>
}







export { FontAwesomeIcon as Icon, Page }
