import React from 'react'
import Router from 'next/router'
import { Page } from '../components/page.js'

export default class extends React.Component{
	constructor(props, context){
		super(props, context)
	}

	componentDidMount(){
		if (!this.props.authenticated) {
			Router.push('/login')
		}
	}

	render() {
		return <Page title="Stats">
			<p>a placeholder, i guess</p>
		</Page>
	}
}
