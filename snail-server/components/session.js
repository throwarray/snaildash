import React from 'react'
import Router, { withRouter } from 'next/router'
import Error from 'next/error'
import { parse } from 'url'

export async function fetchSession () {
	const res = await fetch('/session', {
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: JSON.stringify({ xhr: true }),
		method: 'POST'
	})

	const json = await res.json()

	return json
}

export async function logout () {
	const res = await fetch('/logout', {
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: JSON.stringify({ xhr: true }),
		method: 'POST'
	})

	const json = await res.json()

	return json
}

export async function login (creds) {
	const res = await fetch('/login', {
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: JSON.stringify({ ...creds, xhr: true }),
		method: 'POST'
	})

	const json = await res.json()

	return json
}

export const isRedirectValid = url => {
	if (typeof url === 'string') url = parse(url, true)
	if (!url || !url.path) return false

	const host = window.location.hostname
	const xhost = url.hostname

	if (xhost !== null && xhost !== host) return false

	return true
}

const redirectRoute = (dest, fallback = '/') => {
	let path = Router.query.redirect

	if (typeof path === 'string')
		path = parse(path[0] !== '/' ? '/' + path : path, true)

	if (isRedirectValid(path)) return Router.push(path)

	Router.push(fallback)
}

export {
	redirectRoute as redirect
}

export function withoutAuth (Page, { redirect = true, fallback = '/' } = {}) {
	return withRouter(class extends React.Component {
		static async getInitialProps(ctx) {
			let pageProps = {}

			if (!ctx.session && Page.getInitialProps)
				pageProps = await Page.getInitialProps(ctx)

			return { pageProps }
		}

		followRedirect () {
			let path = Router.query.redirect

			redirectRoute(path && redirect? path: fallback, fallback)
		}

		// Client redirect: The user cannot be logged in.
		constructor (props, context) {
			super(props, context)

			if (!props.isServer && !props.exporting) {
				if (this.props.session)
					this.followRedirect()
			}
		}

		// Client redirect: The user logged in
		componentDidUpdate (prevProps) {
			if (this.props.session && prevProps.session !== this.props.session)
				this.followRedirect()
		}

		render () {
			const { pageProps, ...props } = this.props

			return !props.session?
				<Page {...props} {...pageProps}/>:
				<Error statusCode={403}/>
		}
	})
}

export function withAuth (Page) {
	return class extends React.Component {
		static async getInitialProps(ctx) {
			let pageProps = {}

			if (Page.getInitialProps)
				pageProps = await Page.getInitialProps(ctx)

			return { pageProps }
		}

		// Client redirect: The user must be logged in.
		constructor (props, context) {
			super (props, context)

			if (!this.props.isServer && !this.props.exporting && !this.props.session)
				Router.push({
					pathname: '/login',
					query: { redirect: this.props.router.route }
				})
		}

		// No longer logged in
		componentDidUpdate (prevProps) {
			if (!this.props.session && prevProps.session !== this.props.session)
				Router.push({
					pathname: '/login',
					query: { redirect: this.props.router.route }
				})
		}

		render () {
			const { pageProps, ...props } = this.props

			return props.session?
				<Page {...props} {...pageProps }/>:
				<Error statusCode={403}/>
		}
	}
}
