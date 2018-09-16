import React from 'react'

import Head from 'next/head'

export default () => console.log('TOS RENDER') ||
	<div className="main-content">
		<style jsx>{`
			.main-content {
				flex:1;
			}
		`}</style>
		<Head>
			<title key="title">Welcome to TOS</title>
		</Head>
		<div>
			TOS
		</div>
	</div>
