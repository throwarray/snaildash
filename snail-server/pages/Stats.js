import React from 'react'
const mongoose = require('mongoose')

//TODO: start writing some react thingys maybe? :D

export default class extends React.Component{
	static async getInitialProps({ req }) {
		if (!req.isAuthenticated()) {
			req.res.redirect('/login')
		} else {
			this.userlicense=req.user.license
			return {}
		}

	}

	render(){
		const license = this.userlicense
		mongoose.model('User').findOne({license},(err, result)=>{
			<div className="main-content">
				<p>placeholder, but i know your email is: {result.email} </p>
			</div>
		})

	}
}
