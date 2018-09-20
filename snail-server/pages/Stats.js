import React from 'react'
const mongoose = require('mongoose')
import { isAuthenticated } from '../components/auth.js'

//TODO: start writing some react thingys maybe? :D

export default class extends React.Component{
	static async getInitialProps(context) {
		if (context.req && context.req.headers && !isAuthenticated(context.req)) {
			context.req.res.redirect('/login')
		}
		this.userlicense=context.req.user.license
		return {}
	}

	render(){
		const license = this.license
		mongoose.model('User').findOne({license},(err, result)=>{
			<div className="main-content">
				<p>placeholder, but i know your email is: {result.email} </p>
			</div>
		})

	}
}
