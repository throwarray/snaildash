import Head from 'next/head'

import React from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const defaultStyles = { flex: '1' }

const Page = props => {
	return <div style={props.style || defaultStyles} className={ 'next-page' }>
		<Head>
			{ props.title && <title key="title">{props.title}</title> }
			<meta key="viewport" name="viewport" content="initial-scale=1.0, width=device-width" />
			{/* <noscript key="transitions">
				<style>{`
				.page-transition-enter {
				opacity: initial;
			}
			`}</style>
		</noscript> */}
		</Head>
		{ props.children }
	</div>
}

export { FontAwesomeIcon as Icon, Page }

export default Page
