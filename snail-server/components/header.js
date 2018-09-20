import React from 'react'

import Link from './link.js'

import Router from 'next/router'

// import Head from 'next/head'
class Header extends React.PureComponent {
	constructor (props, ctx) {
		super(props, ctx)

		this.toggleMenu = this.toggleMenu.bind(this)
		this.closeMenu = this.closeMenu.bind(this)
		this.logout = this.logout.bind(this)

		// const routerEvents = Router.router && Router.router.events
		//this.onRouteChangeStart = this.onRouteChangeStart.bind(this)
		// if (routerEvents)
		// 	routerEvents.on('routeChangeStart', this.onRouteChangeStart)

		// routeChangeComplete
		// routeChangeError

		this.state = {
			menu_active: false
		}

		this.styles = {
			imgMargin :{ 'margin': '0 1em', width: '32px', height: '32px' },
			buttonColor: { color: 'white' }
		}
	}

	// componentWillUnmount () {
	// 	Router.router.events.off('routeChangeStart', this.onRouteChangeStart)
	// }
	//
	// onRouteChangeStart (url) {
	// 	console.log('App is changing to: ', url)
	// }

	closeMenu () { this.setState({ menu_active: false }) }

	toggleMenu () { this.setState({ menu_active: !this.state.menu_active }) }

	logout (e) {
		e.preventDefault()

		this.closeMenu()
		this.props.logout().then(()=> {
			Router.push({ pathname: '/', query: {} })
		}, ()=> {})
	}

	render () {
		const authenticated = !!(this.props.authenticated)
		// const activePage = this.props.page

		return <nav className="navbar is-fixed-top is-black" role="navigation" aria-label="main navigation">
			<div className="navbar-brand">
				<Link scroll={false} prefetch href='/'>
					<a className="navbar-item" onClick={this.toggleMenu}>
						<img style={ this.styles.imgMargin } src="/static/logo.png" alt="" />
						SNAIL DASH
					</a>
				</Link>
				<a role="button" style={ this.styles.buttonColor } className={ 'navbar-burger' + (this.state.menu_active ? ' is-active' : '') }  onClick={ this.toggleMenu } data-target="navMenu" aria-label="menu" aria-expanded="false">
					<span aria-hidden="true"></span>
					<span aria-hidden="true"></span>
					<span aria-hidden="true"></span>
				</a>
			</div>
			<div className={'navbar-menu is-black' + (this.state.menu_active ? ' is-active': '') } id="navMenu">
				<div className="navbar-start">
					{/* <a className="navbar-item">
						<span className="icon">

							<i className="fas fa-home"></i>
						</span>
					</a> */}
				</div>
				<div className="navbar-end">
					<style jsx>{`
						.active {
							text-decoration: underline;
						}
					`}
					</style>
					<Link activeClassName="active" scroll={false} prefetch href='/'>
						<a className="navbar-item" onClick={this.closeMenu}>
							Home
						</a>
					</Link>
					<Link activeClassName="active" scroll={false} href='/admin'>
						<a className="navbar-item" style={{ display: authenticated? 'flex' : 'flex' }} onClick={this.closeMenu}>
							Dashboard
						</a>
					</Link>
					{
						authenticated? <Link key="login" activeClassName="active" scroll={false} href='/logout'>
							<a className="navbar-item" onClick={this.logout}>
								Logout
							</a>
						</Link>: <Link key="login" activeClassName="active" scroll={false} prefetch href='/login'>
							<a className="navbar-item" onClick={this.closeMenu}>
								Login
							</a>
						</Link>
					}
					<div className="navbar-item">
						<div className="field is-grouped is-hidden-touch">
							<p className="control">
								<a className="button is-small" href="https://github.com/throwarray/snaildash" target="_blank">
									<span className="icon">
										<i className="fab fa-github" aria-hidden="true"></i>
									</span>
									<span>Github</span>
								</a>
							</p>
							{/* <p className="control">
								<a className="button is-small is-primary" href="https://github.com" target="_blank">
									<span className="icon">
										<i className="fas fa-download" aria-hidden="true"></i>
									</span>
									<span>Download</span>
								</a>
							</p> */}
						</div>
					</div>
				</div>
			</div>
		</nav>
	}
}


export default Header
