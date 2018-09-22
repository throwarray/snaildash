const withCSS = require('@zeit/next-css')

require('dotenv').config({ path: './server/.env' })

module.exports = withCSS({
	// distDir: '.next'
	// cssModules: true
	publicRuntimeConfig: {
		PORT: process.env.PORT,
		APPLICATION_URL: process.env.APPLICATION_URL,
		GAME_URL: process.env.GAME_URL
	}
})
