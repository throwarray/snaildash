import React from 'react'
import Router from 'next/router'

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
		return <div className="main-content">	
			<p>a placeholder, i guess</p>	
		</div>
	}
}