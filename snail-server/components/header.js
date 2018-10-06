import React from 'react'

import Link from './link.js'

import headerLogo from '../static/logo.png'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const NavLink =  ({ children, ...props })=> {
	const onClick = props.onClick

	delete props.onClick

	return <Link activeClassName="active" { ... props }>
		<a className="navbar-item" onClick={ onClick }>
			<style jsx>{`
				.active {
					text-decoration: underline;
				}
			`}</style>
			{ children }
		</a>
	</Link>
}


class Header extends React.PureComponent {
	constructor (props, ctx) {
		super(props, ctx)

		this.toggleMenu = this.toggleMenu.bind(this)
		this.closeMenu = this.closeMenu.bind(this)
		this.logout = this.logout.bind(this)

		this.state = {
			menu_active: false
		}

		this.styles = {
			imgMargin :{ 'margin': '0 1em', width: '32px', height: '32px' },
			buttonColor: { color: 'white' }
		}
	}

	closeMenu () { this.setState({ menu_active: false }) }

	toggleMenu () { this.setState({ menu_active: !this.state.menu_active }) }

	logout (e) {
		e.preventDefault()
		this.props.logout()
	}

	render () {
		const authenticated = this.props.isAuthenticated
		// const activePage = this.props.page

		return <nav className="navbar is-fixed-top is-black" role="navigation" aria-label="main navigation">
			<div className="navbar-brand">
				<Link scroll={false} prefetch href='/'>
					<a className="navbar-item" onClick={this.toggleMenu}>
						<img style={ this.styles.imgMargin } src={headerLogo} alt="" />
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
					<NavLink onClick={this.closeMenu} prefetch href='/'>
						Home
					</NavLink>
					<NavLink onClick={this.closeMenu} prefetch={authenticated} href='/about'>
						About
					</NavLink>
					<NavLink onClick={this.closeMenu} prefetch={authenticated} href='/admin'>
						Dashboard
					</NavLink>
					{
						authenticated? <Link key="login" activeClassName="active" scroll={false} href='/logout'>
							<a className="navbar-item" onClick={this.logout}>
								Logout
							</a>
						</Link>: <NavLink onClick={this.closeMenu} prefetch={!authenticated} href='/login'>
							Login
						</NavLink>
					}

					<div className="navbar-item">
						<div className="field is-grouped is-hidden-touch">
							<p className="control">
								<a className="button is-small" href="https://github.com/throwarray/snaildash" target="_blank">
									<span className="icon">
										<FontAwesomeIcon icon={['fab', 'github']} size="lg"/>
									</span>
								</a>
							</p>
						</div>
					</div>
				</div>
			</div>
		</nav>
	}
}


export default Header
