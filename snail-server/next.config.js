const withSASS = require('@zeit/next-sass')
const withImages = require('next-images')

// const withCSS = require('@zeit/next-css')

require('dotenv').config({ path: './server/.env' })

module.exports = withSASS(withImages({
	// distDir: '.next'
	// cssModules: true
	publicRuntimeConfig: {
		PORT: process.env.PORT,
		APPLICATION_URL: process.env.APPLICATION_URL,
		GAME_URL: process.env.GAME_URL,
		NODE_ENV: process.env.NODE_ENV
	},
	sassLoaderOptions: {
		outputStyle: 'compressed'
	},
	webpack: function (config /*, { isServer }*/) {
		return config
	}
}))
